import jwt from 'jsonwebtoken'

// Combined authentication middleware for user or doctor
const authUserOrDoctor = async (req, res, next) => {
    const { token, dtoken } = req.headers
    
    // Try user token first
    if (token) {
        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET)
            // Set on req object instead of req.body to avoid multer overwriting
            req.userId = token_decode.id
            req.userType = 'user'
            // Also set in body for backward compatibility
            if (req.body) {
                req.body.userId = token_decode.id
            }
            return next()
        } catch (error) {
            // If user token fails, try doctor token
            if (dtoken) {
                try {
                    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
                    req.userId = token_decode.id
                    req.docId = token_decode.id
                    req.userType = 'doctor'
                    // Also set in body for backward compatibility
                    if (req.body) {
                        req.body.userId = token_decode.id
                        req.body.docId = token_decode.id
                    }
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
            req.userId = token_decode.id
            req.docId = token_decode.id
            req.userType = 'doctor'
            // Also set in body for backward compatibility
            if (req.body) {
                req.body.userId = token_decode.id
                req.body.docId = token_decode.id
            }
            return next()
        } catch (error) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
    }
    
    // No token provided
    return res.json({ success: false, message: 'Not Authorized Login Again' })
}

export default authUserOrDoctor

