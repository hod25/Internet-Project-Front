import apiClient, { CanceledError } from "./api-client"


export { CanceledError }

export interface Recipe {
    _id: string,
    title: string,
    content: string,
    owner: string
}

const getAllRecipe = () => {
    const abortController = new AbortController()
    const request = apiClient.get<Recipe[]>("/recipe"
        , { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

export default { getAllRecipe }