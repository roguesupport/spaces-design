/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

define(function (require, exports, module) {
    "use strict";

    var Fluxxor = require("fluxxor"),
        events = require("../events"),
        LayerTree = require("../models/LayerTree");

    var LayerStore = Fluxxor.createStore({
        initialize: function () {
            this._layerTreeMap = {};
            this.bindActions(
                events.documents.DOCUMENT_UPDATED, this._updateDocumentLayers,
                events.layers.VISIBILITY_CHANGED, this._handleVisibilityChange,
                events.layers.LOCK_CHANGED, this._handleLockChange
            );
        },

        getState: function () {
            return {
            };
        },

        /**
         * Passes the layer array to the updated document to be processed
         *
         * @private
         */
        _updateDocumentLayers: function (payload) {
            var documentID = payload.documentID,
                layerTree = new LayerTree(payload.layerArray);
            
            this._layerTreeMap[documentID] = layerTree;
        },

        /**
         * When a layer visibility is toggled, updates the layer object
         */
        _handleVisibilityChange: function (payload) {
            var currentDocumentID = this.flux.store("application").getCurrentDocumentID(),
                documentLayerSet = this._layerTreeMap[currentDocumentID].layerSet,
                updatedLayer = documentLayerSet[payload.id];

            updatedLayer._visible = payload.visible;

            this.emit("change");
        },
        /**
         * When a layer locking is changed, updates the corresponding layer object
         */
        _handleLockChange: function (payload) {
            var currentDocumentID = this.flux.store("application").getCurrentDocumentID(),
                documentLayerSet = this._layerTreeMap[currentDocumentID].layerSet,
                updatedLayer = documentLayerSet[payload.id];

            updatedLayer._locked = payload.locked;

            this.emit("change");
        },

        /**
         * Returns the layer tree for the given document ID
         * @private
         * @param {number} documentID
         * @returns {Array.<Object>} top level layers in the document with rest of the layer tree
         * under children objects
         */
        getLayerTree: function (documentID) {
            return this._layerTreeMap[documentID];
        }
    });
    module.exports = new LayerStore();
});