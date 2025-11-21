import jwt from 'jsonwebtoken'

// Combined authentication middleware for user or doctor
const authUserOrDoctor = async (req, res, next) => {
    const { token, dtoken } = req.headers
    
    // Try user token first
    if (token) {
        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET)
            req.body = req.body || {}
            req.body.userId = token_decode.id
            req.userType = 'user'
            return next()
        } catch (error) {
            // If user token fails, try doctor token
            if (dtoken) {
                try {
                    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
                    req.body = req.body || {}
                    req.body.userId = token_decode.id
                    req.body.docId = token_decode.id // Also set docId for compatibility
                    req.userType = 'doctor'
                    return next()
                } catch (doctorError) {
                    return res.json({ success: false, message: 'Not Authorized Login Again' })
                }
            }
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
    }
    
    // Try doctor token if no user token
    if (dtoken) {
        try {
            const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
            req.body = req.body || {}
            req.body.userId = token_decode.id
            req.body.docId = token_decode.id // Also set docId for compatibility
            req.userType = 'doctor'
            return next()
        } catch (error) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
    }
    
    // No token provided
    return res.json({ success: false, message: 'Not Authorized Login Again' })
}

export default authUserOrDoctor

