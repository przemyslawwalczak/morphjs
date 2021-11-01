import { Controller, Request, Response, RequestMethod } from '../../lib'

export class Landing extends Controller
{
    method = ['GET'] as RequestMethod[]
    url = '/' as string

    async handler(request: Request, response: Response)
    {
        return await response.render('page/landing', {
            array: [1, 2, 3]
        })
    }
}