import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { strict } from 'assert'
import { error } from 'console'
import { TTaskDB, TUserDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})


app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined

        if (searchTerm === undefined){
            const result = await db("users")
            res.status(200).send(result)
        } else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }

    }   catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


app.post("/users", async (req: Request, res: Response) => {
    try {
        
        const {id, name, email, password} = req.body

        if (typeof id !== "string"){
            res.status(400)
            throw new Error("'id' deve ser string")

        }

        if(id.length < 4){
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")

        }

        if (typeof name !== "string"){
            res.status(400)
            throw new Error("'name' deve ser string")

        }

        if(name.length < 4){
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 4 caracteres")

        }

        if (typeof email !== "string"){
            res.status(400)
            throw new Error("'email' deve ser string")

        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

        const [ userAlreadyExixts ]: TUserDB[] | undefined = await db("users").where({ id })

        if(userAlreadyExixts){
            res.status(400)
            throw new Error("'id' ja existe")
        }

        const [ userIdreadyExixts ]: TUserDB[] | undefined = await db("users").where({ email })

        if(userIdreadyExixts){
            res.status(400)
            throw new Error("'email' ja existe")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)

        res.status(201).send({ 
            message: "User criado com sucesso",
            user: newUser
        })

    }   catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})



app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        
        const idToDelete = req.params.id 

        if(idToDelete[1] !== "f"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 'f'")
        }
        
        const [userIdAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({ id: idToDelete})


        if(!userIdAlreadyExists){
            res.status(404)
            throw new Error("'id' não encontrado existe")
        }
            await db("users_tasks").del().where({ user_id: idToDelete }) 
            await db("users").del().where({ id: idToDelete})

            res.status(200).send({message: "User deletado com sucesso"})

    }   catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined

        if (searchTerm === undefined){
            const result = await db("tasks")
            res.status(200).send(result)
        } else {
            const result = await db("tasks")
            .where("title", "LIKE", `%${searchTerm}%`)
            .orWhere("description", "LIKE", `%${searchTerm}%`)

            res.status(200).send(result)
        }

    }   catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks", async (req: Request, res: Response) => {
    try {
        
        const {id, title, description} = req.body

        if (typeof id !== "string"){
            res.status(400)
            throw new Error("'id' deve ser string")

        }

        if(id.length < 4){
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")

        }

        if (typeof title !== "string"){
            res.status(400)
            throw new Error("'title' deve ser string")

        }

        if(title.length < 4){
            res.status(400)
            throw new Error("'title' deve possuir pelo menos 4 caracteres")

        }

        if (typeof description !== "string"){
            res.status(400)
            throw new Error("'description' deve ser string")

        }

       
        const [ taskIdreadyExixts ]: TTaskDB[] | undefined = await db("tasks").where({ id })

        if(taskIdreadyExixts){
            res.status(400)
            throw new Error("'id' ja existe")
        }

        const newTask = {
            id,
            title,
            description
        }

        await db("tasks").insert(newTask)

        const [ insertedTask ]: TTaskDB[] = await db("tasks").where({ id })

        res.status(201).send({ 
            message: "Task criado com sucesso",
            task: insertedTask
        })

    }   catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})