import mongoose from "mongoose";
const { Schema } = mongoose;

const urlSchema = new Schema({
    shortUrl: { type: String, required: true },
    longUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    usedCount: { type: Number, default: 0 },
})

const UrlModel = mongoose.model('Url', urlSchema);

export default UrlModel;