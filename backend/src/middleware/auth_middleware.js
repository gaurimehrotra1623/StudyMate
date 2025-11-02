const validate = async(req,res,next)=>{
  const token = req.cookies.token
  if(!token){
    return res.status(401).json('No token found, authorization denied')
  }
  try{
    const decoded = JWT.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  }
  catch(err){
    return res.status(401).json('Token is not valid')
  }
}