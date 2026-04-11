import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    let token = req.cookies?.token;
    
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

export const isLogin = (req: any, res: Response, next: NextFunction) => {
    if (req.user) {
        return res.status(400).json({ message: 'Already logged in' });
    }
    next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.role === "ADMIN") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};
