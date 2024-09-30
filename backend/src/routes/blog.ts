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
      c.set('userId', response.id);
      await next()
    } else {
      c.status(401)
      return c.json({ error: "unauthorized"})
    }
  
})

blogRouter.get('/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})

blogRouter.get('/bulk', async (c) => {
    return c.text('Hello')
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())

  await prisma.blog.create({
    data: {
        title: body.title,
        content: body.content,
        authorId: 
    }
  })
//   console.log(c.get('userId'));
// 	return c.text('get all blogs route')
})

blogRouter.put('/', (c) => {
	return c.text('signin route')
})
