import { useEffect, useState } from "react";
import postService, { CanceledError, Recipe } from "../services/recipe-service";


const useRecipe = () => {
    const [posts, setPosts] = useState<Recipe[]>([]);
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        console.log("Effect")
        setIsLoading(true)
        const { request, abort } = postService.getAllRecipe()
        request
            .then((res) => {
                setPosts(res.data)
                setIsLoading(false)
            })
            .catch((error) => {
                if (!(error instanceof CanceledError)) {
                    setError(error.message)
                    setIsLoading(false)
                }
            })
        return abort
    }, [])
    return { posts, setPosts, error, setError, isLoading, setIsLoading }
}

export default useRecipe;