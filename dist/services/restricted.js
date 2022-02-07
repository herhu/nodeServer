module.exports = (req, res, next) => {
    if(req.session && req.session.bred){
        console.log('Cookie authorized')
        next()
    } else { 
        res.status(401).json({message: 'no authorized'})
    }
}
