'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchemaFactory = function (schemaProperties, schemaOptions) {
        if (!schemaProperties) {
            throw new Error('Schema properties cannot be undefined');
        }
        schemaProperties.createdOnDate = {type: Date, default: Date.now};
        schemaProperties.updatedOnDate = {type: Date, default: Date.now};
        return new mongoose.Schema(schemaProperties, schemaOptions);
    };
module.exports = BaseSchemaFactory;