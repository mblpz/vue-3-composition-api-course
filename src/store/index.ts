import { reactive, readonly } from 'vue'
import axios from 'axios'

import { Post, NewUser, User } from '../types'

abstract class Store<T extends Object> {
  protected state: T

  constructor() {
    const data = this.data()
    this.state = reactive<T>(data) as T
  }

  protected abstract data(): T
  public getState(): T {
    return readonly(this.state) as T
  }
}

interface PostsState {
  all: Record<string  | number, Post>
  ids: number[]
  loaded: boolean
}

interface UsersState {
  all: Record<string  | number, User>
  ids: number[]
  loaded: boolean
}

interface State {
  posts: PostsState
  users: UsersState
}

interface State {
  users: UsersState
}

export class FluxStore extends Store<State> {
  protected data(): State {
    return {
      posts: {
        loaded: false,
        all: {},
        ids: []
      },
      users: {
        loaded: false,
        all: {},
        ids: []
      }
    }
  }

  async createPost(post: Post) {
    const { data } = await axios.post<Post>('/posts', post)
    const newPost: Post = {...data, id: Math.max(...this.state.posts.ids) + 1}
    this.state.posts.ids.push(newPost.id)
    this.state.posts.all[newPost.id] = newPost
  }

  async fetchPosts() {
    const response = await axios.get<Post[]>('/posts')
    const ids: number[] = []
    const all: Record<string, Post> = {}
    for (const post of response.data) {
      if (!ids.includes(post.id)) {
        ids.push(post.id)
      }
      all[post.id] = post
    }

    this.state.posts.all = all
    this.state.posts.ids = ids
    this.state.posts.loaded = true
  }

  get allPosts(): Post[] {
    return this.state.posts.ids.map(id => this.state.posts.all[id])
  }

  async createUser(newUser: NewUser) {
    const response = await axios.post<User>('/users', newUser)
    const id = this.state.users.ids.length ? Math.max(...this.state.users.ids) : 1
    this.state.users.all[id] = { ...response.data, id }
    this.state.users.ids.push(id)
  }
}

declare global {
  interface Window {
    store: FluxStore
  }
}

const store = new FluxStore()
window.store = store

export const useStore = () => store
