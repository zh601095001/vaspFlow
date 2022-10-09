// Import the RTK Query methods from the React-specific entry point
import {BaseQueryApi} from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import {createApi, FetchArgs, fetchBaseQuery} from '@reduxjs/toolkit/query/react'



const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers, {getState}) => {
        return headers
    }
})

const baseQueryWithReauth = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
    return baseQuery(args, api, extraOptions);
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({

    })
})

// Export the auto-generated hook for the endpoint
// 使用方法：
// const [modify,{isLoading,isFetching,error}] = useModifyMutation()
// const {data, isFetching} = useGetQuery()
export const {

} = api
