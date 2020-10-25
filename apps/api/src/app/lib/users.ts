import { getUserCollection, getUserFrecuentesCollection, ObjectId } from './database';

export async function createOrUpdate(user) {
    const User = await getUserCollection();

    const data = { ...user.usuario };
    delete data['id'];

    return User.updateOne(
        { _id: new ObjectId(user.usuario.id) },
        {
            $set: {
                ...data,
                profesional: user.profesional ? new ObjectId(user.profesional) : null,
                lastLogin: new Date()

            }
        },
        { upsert: true }
    );

}

export async function registerFrecuente(user: string, concepto) {
    const FrecuenteCollection = await getUserFrecuentesCollection();
    return FrecuenteCollection.updateOne(
        {
            userId: new ObjectId(user),
            'concepto.conceptId': concepto.conceptId
        },
        {
            $setOnInsert: {
                userId: new ObjectId(user),
                'concepto': concepto
            },
            $set: {
                lastUse: new Date(),
            },
            $inc: { uses: 1 }
        },
        { upsert: true }
    );
}

export async function getFrecuentes(user: string) {
    const FrecuenteCollection = await getUserFrecuentesCollection();
    return await FrecuenteCollection.find({ userId: new ObjectId(user) }, { sort: { lastUse: -1 }, limit: 15 }).toArray();


}