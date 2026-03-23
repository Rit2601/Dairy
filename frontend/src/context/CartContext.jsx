import { createContext,useContext,useState } from "react"

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({children}) => {

const [cart,setCart] = useState([])

const addToCart = (product)=>{

setCart(prev=>{

const exists = prev.find(p=>p._id === product._id)

if(exists){

return prev.map(p=>
p._id === product._id
? {...p,qty:p.qty+1}
: p
)

}

return [...prev,{...product,qty:1}]

})

}

const removeFromCart = (id)=>{

setCart(cart.filter(p=>p._id!==id))

}

return(

<CartContext.Provider value={{cart,addToCart,removeFromCart}}>

{children}

</CartContext.Provider>

)

}