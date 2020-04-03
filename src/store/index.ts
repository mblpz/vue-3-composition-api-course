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
    const newPost: Post = {
      ...data, 
      id: Math.max(...this.state.posts.ids) + 1,
      authorId: this.currentUser?.id!
    }
    this.state.posts.ids.push(newPost.id)
    this.state.posts.all[newPost.id] = newPost
  }

  async signin(user: User) {
    this.state.users.all[user.id] = user
    this.state.users.ids = Array.from(new Set([...this.state.users.ids, user.id]))
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

  async updatePost(post: Post) {
    const response = await axios.put<Post>(`/posts/${post.id}`, post)
    console.log('ok')
    this.state.posts.all[post.id] = response.data
  }

  async createUser(newUser: NewUser) {
    const response = await axios.post<User>('/users', newUser)
    const id = this.state.users.ids.length ? Math.max(...this.state.users.ids) : 1
    this.state.users.all[id] = { ...response.data, id }
    this.state.users.ids.push(id)
  }

  get authenticated() {
    return this.state.users.ids.some(id => this.state.users.all[id].isCurrentUser)
  }

  get currentUser() {
    const id = this.state.users.ids.find(id => this.state.users.all[id].isCurrentUser)
    if (!id) {
      return
    }
    return this.state.users.all[id]
  }

  async logout() {
    if (!this.currentUser) {
      return
    }

    await axios.post('/logout')
    console.log(this.state.users.all[this.currentUser.id])
    this.state.users.all[this.currentUser.id].isCurrentUser = false
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
