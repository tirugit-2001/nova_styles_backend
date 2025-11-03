import mongoose, { Schema, Document } from "mongoose";

export interface IHero extends Document {
  title: string;
  subtitle?: string;
  image: string;
  price: string
  buttonText?: string;
  buttonLink?: string;
  createdAt: Date;
}

const HeroSchema: Schema = new Schema<IHero>(
    {
        title:{type:String, required:true},
        subtitle:{type:String, required:true},
        image:{type:String, required:true},
        price:{type:String, required:true},
        buttonText:{type: String},
        buttonLink:{type:String}
    },
    {timestamps:true}
);

export default mongoose.model<IHero>("Hero", HeroSchema)