import toast from "react-hot-toast"

export const handleErrors = (errors: string[]): void => {
    if (Array.isArray(errors)) {
        errors.forEach((err, index) => {
            if(index != 0){
                // console.log(err.response?.data)
                toast.error(err)
            }
        })
    }
}