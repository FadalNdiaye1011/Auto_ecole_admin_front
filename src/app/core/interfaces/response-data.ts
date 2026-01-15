export interface ResponseData<T> {
  message: string
  status: boolean
  code: number
  data: T
}
