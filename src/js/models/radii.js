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

    var Immutable = require("immutable");

    var unit = require("js/util/unit"),
        objUtil = require("js/util/object"),
        contentLib = require("adapter/lib/contentLayer");

    /**
     * Model for a bounds rectangle, we extract it from the layer descriptor
     * for the bounds without effects
     * 
     * @constructor
     * @param {object} model
     */
    var Radii = Immutable.Record({
        /**
         * @type {number} Radius of the top-left border
         */
        topLeft: 0,

        /**
         * @type {number} Radius of the top-right border
         */
        topRight: 0,

        /**
         * @type {number} Radius of the bottom-right border
         */
        bottomRight: 0,

        /**
         * @type {number} Radius of the bottom-left border
         */
        bottomLeft: 0
    });

    Object.defineProperties(Radii.prototype, objUtil.cachedGetSpecs({
        /**
         * Convert the set of border radii to a single scalar, or null of the radii
         * are disequal.
         *
         * @return {?number}
         */
        "scalar": function () {
            if (this.topLeft === this.topRight &&
                this.topRight === this.bottomRight &&
                this.bottomRight === this.bottomLeft) {
                return this.topLeft;
            } else {
                return null;
            }
        }
    }));

    /**
     * Construct a Radii object from the given Photoshop layer descriptor.
     *
     * @param {object} descriptor
     * @return {Radii}
     */
    Radii.fromLayerDescriptor = function (descriptor) {
        if (!descriptor.keyOriginType || descriptor.keyOriginType.length === 0) {
            return null;
        }

        var model = {},
            value = descriptor.keyOriginType[0].value,
            type = value.keyOriginType;

        switch (type) {
        case contentLib.originTypes.ORIGIN_RECT:
            model.topLeft = 0;
            model.topRight = 0;
            model.bottomRight = 0;
            model.bottomLeft = 0;
            break;
        case contentLib.originTypes.ORIGIN_ROUNDED_RECT:
            var radii = value.keyOriginRRectRadii.value,
                resolution = objUtil.getPath(descriptor, "AGMStrokeStyleInfo.value.strokeStyleResolution");

            if (resolution === undefined) {
                resolution = 300;
            }

            model.topLeft = unit.toPixels(radii.topLeft, resolution);
            model.topRight = unit.toPixels(radii.topRight, resolution);
            model.bottomRight = unit.toPixels(radii.bottomRight, resolution);
            model.bottomLeft = unit.toPixels(radii.bottomLeft, resolution);
            break;
        default:
            return null;
        }

        return new Radii(model);
    };
    
    module.exports = Radii;
});