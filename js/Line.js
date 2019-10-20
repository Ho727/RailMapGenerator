'use strict';

class Line {
    #svgHeight; #svgWidth; #svgDestWidth; #showOuter;
    themeCity; themeLine; #themeColour;
    #yPc; #padding; #stripPc; #longInterval = 0.2;
    #branchSpacing; #txtFlip;
    #stations = {}; #currentStnId; #direction; #platformNum;
    #weightEN; #weightZH; #fontEN; #fontZH;

    constructor (param) {
        this.#svgHeight = param['svg_height'];
        this.#svgWidth = param['svg_width'];
        this.#svgDestWidth = param['svg_dest_width'];
        this.#showOuter = param['show_outer'];

        [this.themeCity, this.themeLine, this.#themeColour] = param.theme;

        this.#yPc = param['y_pc'];
        this.#padding = param['padding'];
        this.#stripPc = param['strip_pc'];
        this.#branchSpacing = param.branch_spacing;
        this.#txtFlip = param['txt_flip'];

        for (let [stnId, stnInfo] of Object.entries(param['stn_list'])) {
            this.#stations[stnId] = this._initStnInstance(stnId, stnInfo);
        }
        this.#currentStnId = param['current_stn_idx'];
        this.#direction = param['direction'];
        this.#platformNum = param['platform_num'];

        this.#weightEN = param['weightEN'];
        this.#weightZH = param['weightZH'];
        this.#fontEN = param['fontEN'];
        this.#fontZH = param['fontZH'];

        // Calculate other properties of stations
        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.x = this._stnRealX(stnId);
            stnInstance.y = this._stnRealY(stnId);
            stnInstance._state = this._stnState(stnId);
            stnInstance.namePos = (this.#txtFlip) ? Number(!this._stnNamePos(stnId)) : this._stnNamePos(stnId);
        }
    }

    _initStnInstance(stnId, stnInfo) {
        switch (stnInfo.change_type) {
            case 'int2':
                return new Int2Station(stnId, stnInfo);
            case 'int3_l':
                return new Int3LStation(stnId, stnInfo);
            case 'int3_r':
                return new Int3RStation(stnId, stnInfo);
            case 'osi11_ul':
            case 'osi11_pl':
                return new OSI11LStation(stnId, stnInfo);
            case 'osi11_ur':
            case 'osi11_pr':
                return new OSI11RStation(stnId, stnInfo);
            case 'osi12_ul':
            case 'osi12_pl':
                return new OSI12LStation(stnId, stnInfo);
            case 'osi12_ur':
            case 'osi12_pr':
                return new OSI12RStation(stnId, stnInfo);
            default:
                return new Station(stnId, stnInfo);
        }
    }

    set svgWidth(val) {
        val = Number(val);
        if (isNaN(val)) {return;}
        if (val <= 0) {return;}
        this.#svgWidth = val;
        this.#svgDestWidth = val;

        var param = getParams();
        param.svg_width = val;
        param.svg_dest_width = val;
        putParams(param);

        this.drawSVGFrame();

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.x = this._stnRealX(stnId);
            stnInstance.y = this._stnRealY(stnId);
        }
        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();
        this.drawStrip();

        $('#dest_name g:last-child').remove()
        this.drawDestInfo();

        this.loadFonts();
    }

    set yPc(val) {
        val = Number(val);
        this.#yPc = val;

        var param = getParams();
        param.y_pc = val;
        putParams(param);

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.y = this._stnRealY(stnId);
        }
        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();

        this.loadFonts();
    }

    set branchSpacing(val) {
        val = Number(val);
        this.#branchSpacing = val;

        var param = getParams();
        param.branch_spacing = val;
        putParams(param);

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.x = this._stnRealX(stnId);
            stnInstance.y = this._stnRealY(stnId);
        }
        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();

        this.loadFonts();
    }

    set themeColour(rgb) {
        this.#themeColour = rgb;

        var param = getParams();
        param.theme[2] = rgb;
        putParams(param);

        this.fillThemeColour();
    }

    set direction(val) {
        this.#direction = val;

        var param = getParams();
        param.direction = val;
        putParams(param);

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance._state = this._stnState(stnId);
        }

        $('#stn_icons').empty();
        this.drawStns();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();

        $('#dest_name g:last-child').remove()
        this.drawDestInfo();

        this.loadFonts();
    }

    set platformNum(val) {
        this.#platformNum = val;

        var param = getParams();
        param.platform_num = val;
        putParams(param);

        $('#dest_name > #platform > text').text(val);
    }
    set currentStnId(val) {
        this.#currentStnId = val;

        var param = getParams();
        param.current_stn_idx = val;
        putParams(param);

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance._state = this._stnState(stnId);
        }
        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();

        $('#dest_name g:last-child').remove()
        this.drawDestInfo();

        this.loadFonts();
    }

    _pathWeight(stnId1, stnId2) {
        // Path weight from stnId1 to stnId2

        // if (stnId1 == stnId2) {return 0;}
        if (!this.#stations[stnId1]._children.includes(stnId2)) {return -Infinity;}

        var w = 1;
        if ([
            'Int3RStation', 
            'OSI11RStation', 
            'OSI12RStation'
        ].includes(this.#stations[stnId1].constructor.name)) {
            w += this.#longInterval;
        }
        if ([
            'Int3LStation', 
            'OSI11LStation', 
            'OSI12LStation'
        ].includes(this.#stations[stnId2].constructor.name)) {
            w += this.#longInterval;
        }
        return w;
    }

    _cpm(from, to) {
        var self = this;
        // Critical Path Method (FuOR)
        if (from==to) {return 0};
        var allLengths = [];
        for (let child of this.#stations[from]._children) {
            allLengths.push(1 + self._cpm(child, to));
        }
        return Math.max(...allLengths)
    }

    _cp(from, to) {
        var self = this;
        if (from == to) {
            return {
                'len': 0, 
                'nodes': [from]
            };
        }
        var allLengths = [];
        var criticalPaths = [];
        this.#stations[from]._children.forEach(child => {
            var cp = self._cp(child, to);
            if (cp.len < 0) {return;}
            allLengths.push(this._pathWeight(from, child) + cp.len);
            cp.nodes.unshift(from);
            criticalPaths.push(cp.nodes);
        });
        var maxLength = Math.max(...allLengths);
        return {
            'len': maxLength, 
            'nodes': criticalPaths[allLengths.indexOf(maxLength)]
        };
    }


    get criticalPath() {
        var allLengths = [];
        var criticalPaths = [];
        this.leftDests.forEach(ld => {
            this.rightDests.forEach(rd => {
                var cp = this._cp(ld, rd);
                allLengths.push(cp.len);
                criticalPaths.push(cp.nodes);
            });
        });
        var maxLen = Math.max(...allLengths);
        return {
            'len': maxLen,
            'nodes': criticalPaths[allLengths.indexOf(maxLen)]
        };
    }

    get y() {
        return this.#yPc * this.#svgHeight / 100; 
    }

    get stripY() {
        return this.#stripPc * this.#svgHeight / 100;
    }

    get turningRadius() {
        return this.#branchSpacing/2 * (Math.sqrt(2) / (Math.sqrt(2)-1));
    }

    get lineXs() {
        return [
            this.#svgWidth * this.#padding / 100, 
            this.#svgWidth * (1 - this.#padding/100)
        ];
    }

    get leftDests() {
        // var dests = [];
        // for (let stnId in this.#stations) {
        //     if (!this._stnIndegree(stnId)) {dests.push(stnId)};
        // }
        // return dests;
        return this.#stations.linestart._children;
    }

    get rightDests() {
        // var dests = [];
        // for (let stnId in this.#stations) {
        //     if (!this._stnOutdegree(stnId)) {dests.push(stnId)};
        // }
        // return dests;
        return this.#stations.lineend._parents;
    }

    _stnIndegree(stnId) {return this.#stations[stnId].inDegree;}
    _stnOutdegree(stnId) {return this.#stations[stnId].outDegree}

    get stnRealXs() {
        var xs = {};
        for (let stnId in this.#stations) {
            xs[stnId] = this._stnRealX(stnId);
        }
        return xs;
    }

    _stnXShare(stnId) {
        var self = this;

        var cp = this.criticalPath;
        if (cp.nodes.includes(stnId)) {return this._cp(cp.nodes[0], stnId).len;}

        var partSource = stnId;
        var partSink = stnId;
        var leftOpenJaw = false;
        var rightOpenJaw = false;

        while (true) {
            var parent = this.#stations[partSource]._parents[0];
            if (parent == 'linestart') {
                leftOpenJaw = true;
                break;
            }
            partSource = parent;
            if (this._stnOutdegree(partSource) > 1) {
                break;
            }
        }

        while (true) {
            var children = this.#stations[partSink]._children;
            if (children[0] != 'lineend') {
                partSink = children[0];
            } else {
                rightOpenJaw = true;
                break;
            }
            if (this._stnIndegree(partSink) > 1) {
                break;
            }
        }

        var lengthToSource = this._cp(partSource, stnId).len;
        var lengthToSink = this._cp(stnId, partSink).len;
        if (leftOpenJaw) {
            var actualPartLength = this._cp(cp.nodes[0], partSink).len;
            return self._stnXShare(partSink) - lengthToSink / (lengthToSource + lengthToSink) * actualPartLength;
        } else if (rightOpenJaw) {
            var actualPartLength = this._cp(partSource, cp.nodes.slice(-1)[0]).len;
        } else {
            var actualPartLength = this._cp(partSource, partSink).len;
        }
        return self._stnXShare(partSource) + lengthToSource / (lengthToSource + lengthToSink) * actualPartLength;
    }

    _stnRealX(stnId) {
        var [lineStart, lineEnd] = this.lineXs;
        return lineStart + this._stnXShare(stnId) / this.criticalPath.len * (lineEnd - lineStart);
    }

    // get stnRealYs() {
    //     var ys = {};

    //     for (let stnId in this.#stations) {
    //         ys[stnId] = this._stnRealY(stnId);
    //     }
    //     return ys;
    // }

    _stnYShare(stnId) {
        if (['linestart', 'lineend'].includes(stnId) || this._stnIndegree(stnId) > 1 || this._stnOutdegree(stnId) > 1) {
            return 0;
        }
        var stnPred = this.#stations[stnId]._parents[0];
        if (stnPred) {
            // parent exist
            if (this._stnOutdegree(stnPred) == 1) {
                // no sibling, then y same as parent
                return this._stnYShare(stnPred);
            } else {
                // sibling exists, then y depends on its idx of being children
                return (this.#stations[stnPred]._children.indexOf(stnId) == 0) ? 1 : -1;
            }
        } else {
            // no parent, must be linestart
            return 0;
            // never accessed
            // no parent
            if (this.leftDests.length == 1) {
                // no siblings
                return 0
            } else {
                // return (this.leftDests.indexOf(stnId) == 0) ? 1 : -1;
                var tmpStn = stnId;
                while (true) {
                    var tmpSuc = this.#stations[tmpStn]._children[0];
                    if (this._stnIndegree(tmpSuc) == 2) {
                        return (this.#stations[tmpSuc]._parents.indexOf(tmpStn)==0) ? 1 : -1;
                    }
                    tmpStn = this.#stations[tmpStn]._children[0];
                }
            }
            // var stnSuc = this.#stations[stnId]._children[0];
            // if (this._stnIndegree(stnSuc) == 1) {
            //     // no sibling, then y same as child
            //     return this._stnYShare(stnSuc);
            // } else {
            //     // sibling exists
            //     return (this.#stations[stnSuc]._parents.indexOf(stnId) == 0) ? 1 : -1;
            // }
        }
        return 0;
    }

    _stnRealY(stnId) {
        return this.y - this._stnYShare(stnId) * this.#branchSpacing;
    }

    _isSuccessor(stnId1, stnId2) {
        // Is stnId2 a successor of stnId1?
        var self = this;

        var descOfStn1 = this.#stations[stnId1]._children;
        if (!descOfStn1.length) {
            return false;
        } else if (descOfStn1.includes(stnId2)) {
            return true;
        } else {
            for (let desc of descOfStn1) {
                if (self._isSuccessor(desc, stnId2)) {return true;}
            }
        }
        return false;
    }

    _isPredecessor(stnId1, stnId2) {
        // Is stnId2 a predecessor of stnId1?
        var self = this;

        var ansOfStn1 = this.#stations[stnId1]._parents;
        if (!ansOfStn1.length) {
            return false;
        } else if (ansOfStn1.includes(stnId2)) {
            return true;
        } else {
            for (let ans of ansOfStn1) {
                if (self._isPredecessor(ans, stnId2)) {return true;}
            }
        }
        return false;
    }

    _stnState(stnId) {
        if (stnId == this.#currentStnId) {return 0;}
        if (this.#direction == 'r') {
            return this._isSuccessor(this.#currentStnId, stnId) ? 1 : -1;
        } else {
            return this._isPredecessor(this.#currentStnId, stnId) ? 1 : -1;
        }
    }

    _stnNamePos(stnId) {
        var self = this;
        var pos = this.criticalPath.nodes.indexOf(stnId) % 2;
        if (pos == -1) {
            if (this.leftDests.includes(stnId)) {
                pos = 0;
            } else {
                pos = Number(!self._stnNamePos(this.#stations[stnId]._parents[0]));
            }
        }
        return pos;
        return (this.#txtFlip) ? Number(!pos) : pos;
    }

    drawSVGFrame() {
        for (let elem of ['railmap', 'outer']) {
            $(`#${elem}`).attr({
                'width': this.#svgWidth, 
                'height': this.#svgHeight
            });
        }

        for (let elem of ['destination', 'dest_outer']) {
            $(`#${elem}`).attr({
                'width': this.#svgDestWidth, 
                'height': this.#svgHeight
            });
        }
    }

    showFrameOuter() {
        var outerColour = this.#showOuter ? 'black' : 'none';
        $('#outer').attr('stroke', outerColour);
        $('#dest_outer').attr('stroke', outerColour);
    }

    drawStns() {
        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            // $('#stn_icons').append(
            //     stnInstance.drawStnIcon()
            // );
            // $('#stn_names').append(
            //     stnInstance.drawStnName()
            // );
            $('#stn_icons').append(stnInstance.html);
        }
        $('#stn_icons').html($('#stn_icons').html()); // Refresh DOM
        // $('#stn_names').html($('#stn_names').html()); // Refresh DOM
    }

    updateStnNameBg() {
        var stnNameDim = getTxtBoxDim(
            $(`#stn_icons > #${this.#currentStnId} > .Name`)[0], 'railmap'
        );
        $('#current_bg').attr({
            'x': stnNameDim.x-2, 
            'y': stnNameDim.y-2, 
            'width': stnNameDim.width+4, 
            'height': stnNameDim.height+4
        })
    }

    drawLine() {
        // for arc
        var r = this.turningRadius;
        var dx = this.turningRadius - this.#branchSpacing/2;
        var dy = this.#branchSpacing/2;
        var [lineStart, lineEnd] = this.lineXs;
        var cp = this.criticalPath;
        var extraH = (lineEnd - lineStart) / cp.len * this.#longInterval;
        var dh = ( (lineEnd-lineStart)/cp.len - 2*dx ) / 2;
        if (dh < 0) {
            console.log(dh);
            console.warn('SVG width too small!');
        }

        for (let [leftStnId, leftStnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(leftStnId)) {continue;}
            var x1 = this._stnRealX(leftStnId);
            var y1 = this._stnRealY(leftStnId);
            for (let rightStnId of leftStnInstance._children) {
                if (['linestart', 'lineend'].includes(rightStnId)) {continue;}
                var x2 = this._stnRealX(rightStnId);
                var y2 = this._stnRealY(rightStnId);

                var lineType = (leftStnInstance._state + this.#stations[rightStnId]._state < 1) ? 'line_pass' : 'line_main';

                if (y1 == y2) {
                    $(`#${lineType}`).append(
                        `<path d="M ${x1},${y1} H ${x2}"/>`
                    );
                } else if (y1 == this.y && y1 > y2) {
                    if ([
                            'Int3RStation', 
                            'OSI11RStation', 
                            'OSI12RStation'
                        ].includes(leftStnInstance.constructor.name)) {
                        $(`#${lineType}`).append(
                            `<path d="M ${x1},${y1} h ${extraH + dh} a ${r},${r} 0 0,0 ${dx},${-dy} a ${r},${r} 0 0,1 ${dx},${-dy} H ${x2}"/>`
                        );
                    } else {
                        $(`#${lineType}`).append(
                            `<path d="M ${x1},${y1} h ${dh} a ${r},${r} 0 0,0 ${dx},${-dy} a ${r},${r} 0 0,1 ${dx},${-dy} H ${x2}"/>`
                        );
                    }
                    
                } else if (y1 == this.y && y1 < y2) {
                    if ([
                            'Int3RStation', 
                            'OSI11RStation', 
                            'OSI12RStation'
                        ].includes(leftStnInstance.constructor.name)) {
                        $(`#${lineType}`).append(
                            `<path d="M ${x1},${y1} h ${extraH + dh} a ${r},${r} 0 0,1 ${dx},${dy} a ${r},${r} 0 0,0 ${dx},${dy} H ${x2}"/>`
                        );
                    } else {
                        $(`#${lineType}`).append(
                            `<path d="M ${x1},${y1} h ${dh} a ${r},${r} 0 0,1 ${dx},${dy} a ${r},${r} 0 0,0 ${dx},${dy} H ${x2}"/>`
                        );
                    }
                } else if (y2 == this.y && y2 > y1) {
                    if ([
                            'Int3LStation', 
                            'OSI11LStation', 
                            'OSI12LStation'
                        ].includes(this.#stations[rightStnId].constructor.name)) {
                        $(`#${lineType}`).append(
                            `<path d="M ${x2},${y2} h ${-extraH-dh} a ${r},${r} 0 0,1 ${-dx},${-dy} a ${r},${r} 0 0,0 ${-dx},${-dy} H ${x1}"/>`
                        );
                    } else {
                        $(`#${lineType}`).append(
                            `<path d="M ${x2},${y2} h ${-dh} a ${r},${r} 0 0,1 ${-dx},${-dy} a ${r},${r} 0 0,0 ${-dx},${-dy} H ${x1}"/>`
                        );
                    }
                } else {
                    if ([
                            'Int3LStation', 
                            'OSI11LStation', 
                            'OSI12LStation'
                        ].includes(this.#stations[rightStnId].constructor.name)) {
                        $(`#${lineType}`).append(
                            `<path d="M ${x2},${y2} h ${-extraH-dh} a ${r},${r} 0 0,0 ${-dx},${dy} a ${r},${r} 0 0,1 ${-dx},${dy} H ${x1}"/>`
                        );
                    } else {
                        $(`#${lineType}`).append(
                            `<path d="M ${x2},${y2} h ${-dh} a ${r},${r} 0 0,0 ${-dx},${dy} a ${r},${r} 0 0,1 ${-dx},${dy} H ${x1}"/>`
                        );
                    }
                    
                }
            }
        }
        $('#line_main').html($('#line_main').html());
        $('#line_pass').html($('#line_pass').html());
    }

    drawStrip() {
        for (let elem of ['strip', 'dest_strip']) {
            $(`#${elem}`).attr('d', `M 0,${this.stripY} H ${this.#svgWidth}`);
        }
    }

    fillThemeColour() {
        for (let elem of ['line_main', 'strip', 'dest_strip']) {
            $(`#${elem}`).attr('stroke', this.#themeColour);
        }
        $('#dest_name > #platform > circle').attr('fill', this.#themeColour);
    }

    drawDestInfo() {
        $('#dest_name > #platform > text').text(this.#platformNum);

        if (this.#direction == 'l') {
            var destinations = this.leftDests;
            var txtAnchor = 'start';
        } else {
            var destinations = this.rightDests;
            var txtAnchor = 'end';
        }
        var validDest = []
        for (let stnId of destinations) {
            if (this.#stations[stnId]._state >= 0) {validDest.push(stnId)}; 
        }
        var destNameZH = validDest.map(stnId => this.#stations[stnId]._nameZH.replace(/\\/g, ' ')).join('/');
        var destNameEN = validDest.map(stnId => this.#stations[stnId]._nameEN.replace(/\\/g, ' ')).join('/');
        
        $('#dest_name').append(
            `<g text-anchor="${txtAnchor}"> <text class="DestNameZH">往${destNameZH}</text> <text dy="80" class="DestNameEN">to ${destNameEN}</text> </g>`
        );
        $('#dest_name').html($('#dest_name').html());

        var bcr = $('#dest_name > g:last-child')[0].getBoundingClientRect();
        var flagLength = 160 + 150 + bcr.width + 45 + 50;
        var isLeft = (this.#direction == 'l') ? 1 : -1;
        var arrowX = (this.#svgDestWidth - isLeft * flagLength) / 2;
        var arrowRotate = 90 * (1 - isLeft);
        var platformNumX = arrowX + isLeft * (160 + 50 + 75);
        var destNameX = platformNumX + isLeft * (75 + 45);
        $('#dest_name > use').attr('transform', `translate(${arrowX},130)rotate(${arrowRotate})`);
        $('#dest_name > #platform').attr('transform', `translate(${platformNumX},130)`);
        $('#dest_name > g:last-child').attr('transform', `translate(${destNameX},105)`);
    }

    loadFonts() {
        var fontZHToShow = this.#fontEN.concat(this.#fontZH).join(',');
        var fontENToShow = this.#fontEN.join(',');
        
        $('#stn_icons .StnNameZH, .IntNameZH, .OSINameZH').attr('font-family', fontZHToShow);
        $('#stn_icons .StnNameEN, .IntNameEN, .OSINameEN').attr('font-family', fontENToShow);

        $('.DestNameZH').attr('font-family', fontZHToShow);
        $('.DestNameEN').attr('font-family', fontENToShow);
        $('#dest_name > #platform > text').attr('font-family', fontENToShow);
    }

    swapStnName() {
        var param = getParams();
        param.txt_flip = !param.txt_flip;
        putParams(param);

        this.#txtFlip = !this.#txtFlip;

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.namePos = (this.#txtFlip) ? Number(!this._stnNamePos(stnId)) : this._stnNamePos(stnId);
        }

        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        this.loadFonts();
    }

    updateStnName(stnId, nameZH, nameEN) {
        var param = getParams();
        param.stn_list[stnId].name = [nameZH, nameEN];
        putParams(param);

        this.#stations[stnId]._nameZH = nameZH;
        this.#stations[stnId]._nameEN = nameEN;

        $(`#stn_icons #${stnId}`).remove();
        $('#stn_icons').append(this.#stations[stnId].html);
        $('#stn_icons').html($('#stn_icons').html());
        if (stnId == this.#currentStnId) {this.updateStnNameBg();}

        if (this.leftDests.includes(stnId) && this.#direction == 'l') {
            $('#dest_name g:last-child').remove()
            this.drawDestInfo();
        } else if (this.rightDests.includes(stnId) && this.#direction == 'r') {
            $('#dest_name g:last-child').remove()
            this.drawDestInfo();
        }

        this.loadFonts();
    }

    updateStnTransfer(stnId, type, info=null) {
        var prevClass = this.#stations[stnId].constructor.name;

        var param = getParams();
        param.stn_list[stnId].change_type = type;
        if (type == 'none') {
            delete param.stn_list[stnId].transfer;
        } else {
            param.stn_list[stnId].transfer = info;
        }
        putParams(param);

        this.#stations[stnId] = this._initStnInstance(stnId, param.stn_list[stnId]);

        if (prevClass != this.#stations[stnId].constructor.name) {
            // Not sure position, redraw all
            for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
                if (['linestart', 'lineend'].includes(stnId)) {continue;}
                stnInstance.x = this._stnRealX(stnId);
                stnInstance.y = this._stnRealY(stnId);
                stnInstance.namePos = (this.#txtFlip) ? Number(!this._stnNamePos(stnId)) : this._stnNamePos(stnId);
                stnInstance._state = this._stnState(stnId);
            }
            $('#stn_icons').empty();
            this.drawStns();
            this.updateStnNameBg();
    
            $('#line_main').empty();
            $('#line_pass').empty();
            this.drawLine();
            this.drawStrip();
        } else {
            this.#stations[stnId].x = this._stnRealX(stnId);
            this.#stations[stnId].y = this._stnRealY(stnId);
            this.#stations[stnId].namePos = (this.#txtFlip) ? Number(!this._stnNamePos(stnId)) : this._stnNamePos(stnId);
            this.#stations[stnId]._state = this._stnState(stnId);
            $(`#stn_icons #${stnId}`).remove();
            $('#stn_icons').append(this.#stations[stnId].html);
            $('#stn_icons').html($('#stn_icons').html());
        }
        this.loadFonts();
    }

    removeStn(stnId) {
        var param = getParams();

        var parents = this.#stations[stnId]._parents;
        var children = this.#stations[stnId]._children;

        var isLastMainBranchStn = true;
        // for (let [id, instance] of Object.entries(this.#stations)) {
        //     if (id == stnId) {continue;}
        //     if (instance._y == this.y) {
        //         isLastMainBranchStn = false;
        //         break;
        //     }
        // }
        // Object.keys(this.#stations).forEach(id => {
        //     if ([stnId, 'linestart', 'lineend'].includes(id)) {return;}

        // })
        for (let id in this.#stations) {
            if ([stnId, 'linestart', 'lineend'].includes(id)) {continue;}
            if (this._stnYShare(id) == 0) {
                isLastMainBranchStn = false;
                break;
            }
        }

        if (parents.length == 2 && children.length == 2) {
            // To be rewritten, join two branches
            return false;
        } else if (isLastMainBranchStn) {
            // Last main line station
            return false;
        } else if (Object.keys(param.stn_list).length == 4) {
            // Last two stations
            return false;
        } else if (parents.length == 2 || children.length == 2) {
            parents.forEach(parId => {
                param.stn_list[parId].children = children;
                this.#stations[parId]._children = children;
            });
            children.forEach(childId => {
                param.stn_list[childId].parents = parents;
                this.#stations[childId]._parents = parents;
            })
        } else if (this._stnOutdegree(parents[0])==2 && this._stnIndegree(children[0])==2) {
            // 1 par 1 child, last station on upper/lower branch
            var childIdxOfPar = this.#stations[parents[0]]._children.indexOf(stnId);
            var parIdxOfChild = this.#stations[children[0]]._parents.indexOf(stnId);
            param.stn_list[parents[0]].children.splice(childIdxOfPar, 1);
            this.#stations[parents[0]]._children.splice(childIdxOfPar, 1);
            param.stn_list[children[0]].parents.splice(parIdxOfChild, 1);
            this.#stations[children[0]]._parents.splice(parIdxOfChild, 1);
        } else {
            // 1 par 1 child
            parents.forEach(parId => {
                var idx = param.stn_list[parId].children.indexOf(stnId);
                if (children.length) {
                    param.stn_list[parId].children[idx] = children[0];
                    this.#stations[parId]._children[idx] = children[0];
                } else {
                    // Right dest
                    param.stn_list[parId].children.splice(idx, 1);
                    this.#stations[parId]._children.splice(idx, 1);
                }
            });
            children.forEach(childId => {
                var idx = param.stn_list[childId].parents.indexOf(stnId);
                if (parents.length) {
                    param.stn_list[childId].parents[idx] = parents[0];
                    this.#stations[childId]._parents[idx] = parents[0];
                } else {
                    // Left dest
                    param.stn_list[childId].parents.splice(idx, 1);
                    this.#stations[childId]._parents.splice(idx, 1);
                }
            })
        }

        delete param.stn_list[stnId];
        delete this.#stations[stnId];

        var isCurrentStnChanged = false;
        if (this.#currentStnId == stnId) {
            var newCurrentStnId = Object.keys(this.#stations)[1];
            this.#currentStnId = newCurrentStnId;
            param.current_stn_idx = newCurrentStnId;
            isCurrentStnChanged = true;
        }
        putParams(param);


        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.x = this._stnRealX(stnId);
            stnInstance.y = this._stnRealY(stnId);
            stnInstance.namePos = (this.#txtFlip) ? Number(!this._stnNamePos(stnId)) : this._stnNamePos(stnId);
            if (isCurrentStnChanged) {
                stnInstance._state = this._stnState(stnId);
            }
        }
        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();
        this.drawStrip();

        $('#dest_name g:last-child').remove()
        this.drawDestInfo();

        this.loadFonts();
        return true;
    }

    newStnPossibleLoc(prep, stnId) {
        var deg = (prep == 'before') ? this._stnIndegree(stnId) : this._stnOutdegree(stnId);
        switch (deg) {
            case 2:
                // 1 -> 2
                return [1,1,1,0,0];
            case 1:
                if (this._stnYShare(stnId) == 0) {
                    // 1 -> 1
                    var state = this.newBranchPossibleEnd(prep, stnId);
                    state = (state.length) ? state : 0;
                    return [1,0,0,state,state];
                    // [1,0,0,1,1];
                } else if (this.#stations[stnId]._y > this.y) {
                    if (prep == 'before') {
                        return [this._stnOutdegree(this.#stations[stnId]._parents[0])-1, 
                            0,1,0,0
                        ];
                    } else {
                        return [this._stnIndegree(this.#stations[stnId]._children[0])-1, 
                            0,1,0,0
                        ];
                    }
                } else {
                    if (prep == 'before') {
                        return [this._stnOutdegree(this.#stations[stnId]._parents[0])-1, 
                            1,0,0,0
                        ];
                    } else {
                        return [this._stnIndegree(this.#stations[stnId]._children[0])-1, 
                            1,0,0,0
                        ];
                    }
                }
            // case 0:
            //     if (this.#stations[stnId]._y == this.y) {
            //         return [1,0,0,0,0];
            //     } else if (this.#stations[stnId]._y > this.y) {
            //         return [1,0,1,0,0];
            //     } else {
            //         return [1,1,0,0,0];
            //     }
        }
        return [0,0,0,0,0];
    }

    newBranchPossibleEnd(prep, stnId) {
        var res = [];
        if (prep == 'before') {
            while (this._stnIndegree(stnId) == 1) {
                stnId = this.#stations[stnId]._parents[0];
                res.unshift(stnId);
                // if (stnId == 'linestart') {return res;}
                // if (this._stnIndegree(stnId) == 2) {return res;}

            }
            res.pop();
        } else {
            while (this._stnOutdegree(stnId) == 1) {
                stnId = this.#stations[stnId]._children[0];
                res.push(stnId);
            }
            res.shift();
        }
        return res;
    }

    addStn(prep, stnId, loc, end) {
        var newId = getRandomId();
        while (Object.keys(this.#stations).includes(newId)) {
            newId = getRandomId();
        }

        var param = getParams();
        var newInfo = {};

        if (prep == 'before') {
            if (loc == 'centre') {
                newInfo.parents = this.#stations[stnId]._parents;
                if (this._stnIndegree(stnId)==0 && this.#stations[stnId]._y != this.y) {
                    newInfo.children = this.leftDests;
                } else if (this.#stations[stnId]._y != this.y) {
                    newInfo.children = this.#stations[this.#stations[stnId]._parents[0]]._children;
                } else {
                    newInfo.children = [stnId];
                }
                newInfo.parents.forEach(par => {
                    this.#stations[par]._children = [newId];
                    param.stn_list[par].children = [newId];
                });
                newInfo.children.forEach(child => {
                    this.#stations[child]._parents = [newId];
                    param.stn_list[child].parents = [newId];
                });
            } else if (loc == 'upper') {
                if (this._stnIndegree(stnId) == 2) {
                    newInfo.parents = this.#stations[stnId]._parents.slice(0,1);
                    newInfo.children = [stnId];
                    newInfo.parents.forEach(par => {
                        this.#stations[par]._children = [newId];
                        param.stn_list[par].children = [newId];
                    });
                    this.#stations[stnId]._parents[0] = newId;
                    param.stn_list[stnId].parents[0] = newId;
                } else {
                    // already on branch
                    newInfo.parents = this.#stations[stnId]._parents;
                    newInfo.children = [stnId];
                    newInfo.parents.forEach(par => {
                        this.#stations[par]._children[0] = newId;
                        param.stn_list[par].children[0] = newId;
                    });
                    newInfo.children.forEach(child => {
                        this.#stations[child]._parents = [newId];
                        param.stn_list[child].parents = [newId];
                    });
                }
            } else if (loc == 'lower') {
                if (this._stnIndegree(stnId) == 2) {
                    newInfo.parents = this.#stations[stnId]._parents.slice(1);
                    newInfo.children = [stnId];
                    newInfo.parents.forEach(par => {
                        this.#stations[par]._children = [newId];
                        param.stn_list[par].children = [newId];
                    });
                    this.#stations[stnId]._parents[1] = newId;
                    param.stn_list[stnId].parents[1] = newId;
                } else {
                    // already on branch
                    newInfo.parents = this.#stations[stnId]._parents;
                    newInfo.children = [stnId];
                    newInfo.parents.forEach(par => {
                        this.#stations[par]._children[0] = newId;
                        param.stn_list[par].children[0] = newId;
                    });
                    newInfo.children.forEach(child => {
                        this.#stations[child]._parents = [newId];
                        param.stn_list[child].parents = [newId];
                    });
                }
            } else if (loc == 'newupper') {
                newInfo.parents = [end];
                newInfo.children = [stnId];
                
                this.#stations[end]._children.unshift(newId);
                param.stn_list[end].children.unshift(newId);

                this.#stations[stnId]._parents.unshift(newId);
                param.stn_list[stnId].parents.unshift(newId);
            } else if (loc == 'newlower') {
                newInfo.parents = [end];
                newInfo.children = [stnId];
                
                this.#stations[end]._children.push(newId);
                param.stn_list[end].children.push(newId);

                this.#stations[stnId]._parents.push(newId);
                param.stn_list[stnId].parents.push(newId);
            }
        } else {
            if (loc == 'centre') {
                newInfo.children = this.#stations[stnId]._children;
                if (this._stnOutdegree(stnId)==0 && this.#stations[stnId]._y != this.y) {
                    newInfo.parents = this.rightDests;
                } else if (this.#stations[stnId]._y != this.y) {
                    newInfo.parents = this.#stations[this.#stations[stnId]._children[0]]._parents;
                } else {
                    newInfo.parents = [stnId];
                }
                newInfo.children.forEach(child => {
                    this.#stations[child]._parents = [newId];
                    param.stn_list[child].parents = [newId];
                });
                newInfo.parents.forEach(par => {
                    this.#stations[par]._children = [newId];
                    param.stn_list[par].children = [newId];
                });
            } else if (loc == 'upper') {
                if (this._stnOutdegree(stnId) == 2) {
                    newInfo.children = this.#stations[stnId]._children.slice(0,1);
                    newInfo.parents = [stnId];
                    newInfo.children.forEach(child => {
                        this.#stations[child]._parents = [newId];
                        param.stn_list[child].parents = [newId];
                    });
                    this.#stations[stnId]._children[0] = newId;
                    param.stn_list[stnId].children[0] = newId;
                } else {
                    // already on branch
                    newInfo.children = this.#stations[stnId]._children;
                    newInfo.parents = [stnId];
                    newInfo.children.forEach(child => {
                        this.#stations[child]._parents[0] = newId;
                        param.stn_list[child].parents[0] = newId;
                    });
                    newInfo.parents.forEach(par => {
                        this.#stations[par]._children = [newId];
                        param.stn_list[par].children = [newId];
                    });
                }
            } else if (loc == 'lower') {
                if (this._stnOutdegree(stnId) == 2) {
                    newInfo.children = this.#stations[stnId]._children.slice(1);
                    newInfo.parents = [stnId];
                    newInfo.children.forEach(child => {
                        this.#stations[child]._parents = [newId];
                        param.stn_list[child].parents = [newId];
                    });
                    this.#stations[stnId]._children[1] = newId;
                    param.stn_list[stnId].children[1] = newId;
                } else {
                    // already on branch
                    newInfo.children = this.#stations[stnId]._children;
                    newInfo.parents = [stnId];
                    newInfo.children.forEach(child => {
                        this.#stations[child]._parents[0] = newId;
                        param.stn_list[child].parents[0] = newId;
                    });
                    newInfo.parents.forEach(par => {
                        this.#stations[par]._children = [newId];
                        param.stn_list[par].children = [newId];
                    });
                }
            } else if (loc == 'newupper') {
                newInfo.children = [end];
                newInfo.parents = [stnId];
                
                this.#stations[end]._parents.unshift(newId);
                param.stn_list[end].parents.unshift(newId);

                this.#stations[stnId]._children.unshift(newId);
                param.stn_list[stnId].children.unshift(newId);
            } else if (loc == 'newlower') {
                newInfo.children = [end];
                newInfo.parents = [stnId];
                
                this.#stations[end]._parents.push(newId);
                param.stn_list[end].parents.push(newId);

                this.#stations[stnId]._children.push(newId);
                param.stn_list[stnId].children.push(newId);
            }
        }

        newInfo.name = [`車站${newId.toUpperCase()}`, `Station ${newId.toUpperCase()}`];
        newInfo.change_type = 'none';
        
        param.stn_list[newId] = newInfo;
        putParams(param);

        this.#stations[newId] = this._initStnInstance(newId, newInfo);

        for (let [stnId, stnInstance] of Object.entries(this.#stations)) {
            if (['linestart', 'lineend'].includes(stnId)) {continue;}
            stnInstance.x = this._stnRealX(stnId);
            stnInstance.y = this._stnRealY(stnId);
            stnInstance._state = this._stnState(stnId);
            stnInstance.namePos = (this.#txtFlip) ? Number(!this._stnNamePos(stnId)) : this._stnNamePos(stnId);
        }

        $('#stn_icons').empty();
        this.drawStns();
        this.updateStnNameBg();

        $('#line_main').empty();
        $('#line_pass').empty();
        this.drawLine();
        this.drawStrip();

        $('#dest_name g:last-child').remove();
        this.drawDestInfo();

        this.loadFonts();

        return [newId, newInfo];
        console.log(newInfo);
        console.log(param);
    }

    static clearSVG() {
        $('#stn_icons').empty();
        $('#line_main').empty();
        $('#line_pass').empty();
        $('#dest_name g:last-child').remove();
    }
}