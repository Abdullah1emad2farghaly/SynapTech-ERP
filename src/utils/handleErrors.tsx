
export default function handleErrors(errors: string[] | string) {
    if (Array.isArray(errors)){
        errors.forEach((error, index)=> {
            return (
                <div>
                    
                </div>
            )
        })
    }
}
