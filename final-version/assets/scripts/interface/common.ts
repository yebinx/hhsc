export interface ServerResult<T>{
    error_code:number
    data:T
    req?:any
}