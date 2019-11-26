module.exports = (data = {}, success = true) => {
    return {
        meta: {
            success
        },
        data: {
            ...data
        }
    }
}