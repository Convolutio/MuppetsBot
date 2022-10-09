import path from "node:path";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, Sequelize, DataTypes } from "sequelize";

const db_path = path.join(__dirname, '../..', "database.db");

export class Quote extends Model<InferAttributes<Quote>, InferCreationAttributes<Quote>> {
    declare quote_id: CreationOptional<number>;
    declare quote: string;
    declare author_whkId: ForeignKey<string>;
    declare attachment: ArrayBuffer|null;
    declare attachment_url: string|null;
};

export class db_Character extends Model<
    InferAttributes<db_Character>,
    InferCreationAttributes<db_Character>> {
    declare name:string;
    declare whkId:string;
    declare whkToken:string;
};

const db = new Sequelize({
    dialect:'sqlite',
    storage:db_path,
    logging:false,
    host:'localhost'
});

db_Character.init({
    name:{
        type:DataTypes.TEXT,
        allowNull:false,
        unique:true
    },
    whkId:{
        type:DataTypes.STRING(30),
        primaryKey:true
    },
    whkToken:{
        type:DataTypes.STRING(200),
        allowNull:false
    }
},{sequelize:db, tableName:'characters', modelName:'characters'});

Quote.init({
    quote:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    quote_id: {
        type:DataTypes.INTEGER,
        primaryKey:true
    },
    attachment: {
        type:DataTypes.BLOB,
        allowNull:true
    },
    attachment_url: {
        type:DataTypes.TEXT,
        allowNull:true
    }
}, {sequelize:db, tableName:'quotes', modelName:'quotes'});

Quote.belongsTo(db_Character, {foreignKey:"author_whkId", targetKey:"whkId"});

export const database = db;