import API from "./api"

export const getProducts = async () => {

  const res = await API.get("/products")

  return res.data

}