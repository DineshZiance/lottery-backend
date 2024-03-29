import { Request, Response } from "express";
import { User } from "../entity/User";
import { hashText } from "../helper/bcrypt";
//import { sendEmail } from "../helper/emailHelper";
import AppDataSource from "../ormconfig";
import Template from "../response/index";
class UserController {
  public static getUser = async (req: Request, res: Response) => {
    try {
    const userRepository = AppDataSource.getRepository(User);
    const data =  await userRepository.find({
      where : {
        isDeleted:false
      }
    })
      return res.json(Template.success("User Fetched Succesfully", data));
    } catch (error) {
      return res.status(401).json(Template.userNotFound());
    }
  };
  public static getUserById = async (req: Request, res: Response) => {
    try {
      let userId = req.params.userId;
      const userRepository = AppDataSource.getRepository(User);
    const user =  await userRepository.find({
      where : {
        userId: userId,
        isDeleted:false
      }
    })
       if (user.length) {
        return res.json(Template.success("Users Feated succesfully", user));
      }
      return res.status(401).json(Template.userNotFound());
    } catch (error) {
      return res.status(401).json(Template.userNotFound());
    }
  };
  public static addUser = async (req: Request, res: Response, next: any) => {
    try {
      const {
        firstName,
        lastName,
        phone,
        userName,
        email,
        passwordHash,
        isActive,
      } = req.body;
      const hashPassword = await hashText(passwordHash);
      const user = AppDataSource.getRepository(User).create({
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        userName: userName.trim(),
        email: email,
        passwordHash: hashPassword,
        isActive: isActive ? isActive : true,
        credits:53
        //createdBy: res.locals.jwt.userId,
      });
      const results = await AppDataSource.getRepository(User).save(user);
      delete results.passwordHash;
      //await sendEmail(email, "Welcome To lotry", "Welcome to lotry, continue using our application.");
     
      return res.json(Template.success("Users created succesfully", results));
    } catch (error) {
      console.log(error);
      
      return res.status(401).json({ message: "error occured", error });
    }
  };
  public static updateUser = async (req: Request, res: Response) => {
    const userId = await AppDataSource.getRepository(User).findOne({
      where: {
        userId: req.params.userId,
      },
    });
    if (!userId) {
      return res.status(401).json(Template.userNotFound());
    }
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .update(User)
      .set({
        ...req.body,
        // updatedBy: res.locals.jwt.userId,
      })
      .where("userId = :userId", { userId: req.params.userId })
      .execute();
      const userRepository = AppDataSource.getRepository(User);
      const user =  await userRepository.find({
        where : {
          userId:req.params.userId,
          isDeleted:false
        }
      })
    if (user.length) {
      return res.json(Template.success("Users Updated succesfully",user));
    }
    return res.status(401).json(Template.userNotFound());
  };
  public static deleteUser = async (req: Request, res: Response) => {
    const userId = await AppDataSource.getRepository(User).findOne({
      where: {
        userId: req.params.userId,
      },
    });
    if (!userId) {
      return res.status(401).json(Template.userNotFound());
    }
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .update(User)
      .set({
        isDeleted: true,
      })
      .where("userId = :userId", { userId: req.params.userId })
      .execute();
    return res.json(Template.success("User delete succesfully"));
  };
}
export default UserController;
