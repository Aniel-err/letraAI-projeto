import db from '../models/index.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const { Redacao, User, Turma, Proposta } = db;

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const uploadBase64ToS3 = async (base64String) => {
    const base64Data = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = base64String.split(';')[0].split('/')[1];
    const fileName = `correcoes/${crypto.randomBytes(16).toString('hex')}.${type}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`,
        ACL: 'public-read'
    });

    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};


export const createRedacao = async (req, res) => {
    try {
        const userId = req.userData.id;
        const { turmaId, propostaId } = req.body;

        if (!req.file) return res.status(400).json({ message: 'Imagem obrigatória.' });

        const imagemUrl = req.file.location;

        const novaRedacao = await Redacao.create({
            userId, turmaId, propostaId, imagemUrl, status: 'Enviada'
        });
        res.status(201).json(novaRedacao);
    } catch (error) {
        res.status(500).json({ message: `Erro no S3: ${error.message}` });
    }
};

export const updateRedacaoImage = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });
        if (!req.file) return res.status(400).json({ message: 'Nenhuma nova imagem foi enviada.' });

        redacao.imagemUrl = req.file.location;
        redacao.status = 'Enviada';
        redacao.editedAt = new Date();
        
        redacao.notaTotal = null; 
        await redacao.save();
        res.status(200).json({ message: 'Redação atualizada!', redacao });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const corrigirRedacao = async (req, res) => {
    try {
        const { id } = req.params;
        const redacao = await Redacao.findByPk(id);
        if (!redacao) return res.status(404).json({ message: 'Não encontrada.' });

        redacao.notaTotal = req.body.total;
        redacao.status = req.body.status || 'Corrigida';
        
        if (req.body.imagemBase64) {
            redacao.imagemUrl = await uploadBase64ToS3(req.body.imagemBase64);
        } else if (req.file) {
            redacao.imagemUrl = req.file.location;
        }

        await redacao.save();
        res.status(200).json({ message: 'Correção salva!', redacao });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar correção.' });
    }
};

export const solicitarReenvio = async (req, res) => {
    const { id } = req.params;
    const redacao = await Redacao.findByPk(id);
    redacao.status = 'Solicitado Reenvio';
    await redacao.save();
    res.status(200).json({ message: 'Solicitação enviada!' });
};

export const autorizarReenvio = async (req, res) => {
    const { id } = req.params;
    const redacao = await Redacao.findByPk(id);
    redacao.status = 'Reenvio Autorizado';
    await redacao.save();
    res.status(200).json({ message: 'Reenvio autorizado!' });
};