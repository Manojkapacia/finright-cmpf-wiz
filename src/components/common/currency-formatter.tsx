export const formatCurrency = (value:any) => {
    if(!value) return 
    return `₹ ${value.toLocaleString("en-IN")}`
}

export const parseCurrency = (value:any) => {
    if(!value) return 
    return Number(value.toString().replace(/[₹,]/g, ""))
}