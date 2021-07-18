import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/connectDB';
import cors from '../../middleware/cors';
import runMiddleware from '../../utils/runMiddleware';
import { User } from '../../models/User';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await runMiddleware(req, res, cors);

	switch (req.method) {
		case 'POST':
			if (!req.body) return res.status(400).json({ msg: 'Request Invalid' });

			const { email, phone, username, password } = req.body;

			if (
				!((email && password) || (phone && password) || (username && password))
			)
				return res
					.status(400)
					.json({ msg: 'Please enter all the required fields' });

			if (email) {
				try {
					const usr = await User.findOne({ email }, (err: any, obj: any) =>
						console.log(obj)
					);
					compare(password, usr.password, (err: any, obj: any) => {
						if (!err && obj) {
							const { fullName, username } = usr;
							const token = jwt.sign(
								{
									user: usr.id,
								},
								// @ts-ignore
								process.env.JWT_SECRET,
								{ expiresIn: '15d' }
							);

							return res
								.status(200)
								.setHeader('Authorization', 'Bearer ' + token)
								.json({
									msg: 'User signed in successfully',
									data: {
										fullName,
										username,
										email: usr.email,
										phone: usr.phone,
									},
								});
						} else {
							return res.status(401).json({ msg: "Credentials don't match" });
						}
					});
				} catch (err) {
					return res.status(400).json({ msg: 'Something went wrong' });
				}
			}

			break;
		default:
			return res.status(405).end('Method Not Allowed'); //Method Not Allowed
	}
};

export default connectDB(handler);
