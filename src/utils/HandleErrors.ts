import toast from "react-hot-toast"

export const handleErrors = (errors: string[] | any): void => {
    if (Array.isArray(errors)) {
        errors.forEach((err, index) => {
            if(index != 0){
                // console.log(err.response?.data)
                toast.error(err)
            }
        })
    }else {
        for (const key in errors) {
            errors[key].forEach((err:string) => {
                toast.error(err)
            });
        }
    }
}