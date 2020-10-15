import {Request,Response} from 'express'
import {getRepository} from 'typeorm'
import Orphanage from '../models/Orphanage';
import orphanageView from '../views/orphanage_view';
import * as Yup from 'yup'
export default{

    async show(request:Request,response:Response){
        const {id} = request.params
        const orphanagesRepository = getRepository(Orphanage);
        const orphanage = await orphanagesRepository.findOneOrFail(id,{
            relations:['images']
        });
        return response.json(orphanageView.render(orphanage));
    },
    async index(request:Request,response:Response){
        const orphanagesRepository = getRepository(Orphanage);
        const orphanages = await orphanagesRepository.find({
            relations:['images']
        });
        return response.json(orphanageView.renderMany(orphanages));
    },
    async create(request:Request,response:Response){
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        }=request.body
        const orphanagesRepository = getRepository(Orphanage);
        const requestImages = request.files as Express.Multer.File[];
        const images = requestImages.map(image=>{
            return {path:image.filename}
        })
        
        const data ={
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            images
        };
        const schema = Yup.object().shape({
            name: Yup.string().required('Name is required.'),
            latitude: Yup.number().required('Latitude is required.'),
            longitude: Yup.number().required('Longitude is required.'),
            about: Yup.string().required('about section is required.').max(300),
            instructions: Yup.string().required('Instructions are required.'),
            opening_hours: Yup.string().required('opening hours information is required.'),
            open_on_weekends: Yup.boolean().required('information about the availability on weekends is required.'),
            images: Yup.array(
              Yup.object().shape({
                path: Yup.string().required()
            }))   
        })
        await schema.validate(data, {
            abortEarly: false,
          });
        const orphanage = orphanagesRepository.create(data);
        await orphanagesRepository.save(orphanage)
        return response.json({message:'Hello World'})
    }
}