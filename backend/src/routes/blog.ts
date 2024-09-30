import { Hono } from "hono";
import { decode, sign, verify } from 'hono/jwt'
import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string,
    }
}>();

blogRouter.use('/*', async (c, next) => {

    const header = c.req.header("authorization") || "";
    if( !header ){
      c.status(401);
      return c.json({error: "unauthorized"});
    }
    const  token = header.split(" ")[1]
  
    const response = await verify(token, c.env.JWT_SECRET)
    if(response.id){
      c.set('userId', response.id as string);
      await next()
    } else {
      c.status(401)
      return c.json({ error: "unauthorized"})
    }
  
})

blogRouter.get('/', async (c) => {
	const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id: body.id
            }
        })

        return c.json({
            blog
        })

    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    //sTODO: s hould add pagination
    try {
        const blogs = await prisma.blog.findMany()
        return c.json({
            blogs
        })

    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blogs"
        });
    }
    
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const userId = c.get("userId");
    const blog = await prisma.blog.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId
        }
    })

    return c.json({
        id: blog.id
    })

})

blogRouter.put('/', async (c) => {
	const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,
        }
    })

    return c.json({
        id: blog.id
    })
})
