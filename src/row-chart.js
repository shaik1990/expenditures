dc.rowChart = function(parent, chartGroup) {

    var _g;

    var _labelOffsetX = 10;

    var _labelOffsetY = 15;

    var _gap = 5;

    var _rowCssClass = "row";

    var _chart = dc.marginable(dc.singleSelectionChart(dc.colorChart(dc.baseChart({}))));

    var _xScale;

    var _xAxis = d3.svg.axis().orient("bottom");

    var _xElasticity = false;

    _chart.doRender = function() {
        _xScale = d3.scale.linear().domain([0, d3.max(_chart.group().all(), _chart.valueAccessor())]).range([0, _chart.effectiveWidth()]);

        _chart.resetSvg();

        _g = _chart.svg()
            .append("g")
            .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

        prepareXScale();
        prepareXAxis();
        drawGridLines();
        drawXAxis();
        drawChart();

        return _chart;
    };

    _chart.title(function (d) {
        return _chart.keyAccessor()(d) + ": " + _chart.valueAccessor()(d) ;
    });

    _chart.label(function (d) {
        return _chart.keyAccessor()(d);
    });

    function prepareXScale() {
        _xScale = d3.scale.linear().domain([0, d3.max(_chart.group().all(), _chart.valueAccessor())]).range([0, _chart.effectiveWidth()]);
    }

    function prepareXAxis() {
        _xAxis.scale(_xScale);
    }

    function drawXAxis() {
        var axis = _g.selectAll("g.axis");
        if (axis.empty()) {
            axis = _g.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")");
        }

        dc.transition(axis, _chart.transitionDuration())
            .call(_xAxis);
    }

    function drawGridLines() {
        var gridLineG = _g.selectAll("g.grid-line");
        if (gridLineG.empty()) {
            gridLineG_g = _g.append("g")
                          .attr("class", "grid-line vertical");
        }

        var ticks = _xAxis.tickValues() ? _xAxis.tickValues() : _xScale.ticks(_xAxis.ticks()[0]);

        var lines = gridLineG.selectAll("line")
                             .data(ticks);

        // enter
        var linesGEnter = lines.enter()
                               .append("line")
                               .attr("x1", function (d) { return _xScale(d); })
                               .attr("y1", function (d) { return 0; })
                               .attr("x2", function (d) { return _xScale(d); })
                               .attr("y2", function (d) { return _chart.effectiveHeight(); })
                               .attr("opacity", 0);

        dc.transition(linesGEnter, _chart.transitionDuration())
            .attr("opacity", 1);

        // update
        dc.transition(lines, _chart.transitionDuration())
            .attr("x1", function (d) { return _xScale(d); })
            .attr("y1", function (d) { return 0; })
            .attr("x2", function (d) { return _xScale(d); })
            .attr("y2", function (d) { return _chart.effectiveHeight(); });

        // exit
        lines.exit().remove();
    }

    function drawChart() {
        if (_chart.elasticX()) {
            prepareXScale();
            prepareXAxis();
            drawGridLines();
            drawXAxis();
        }

        var rows = _g.selectAll("g." + _rowCssClass)
                     .data(_chart.group().all());

        createElements(rows, _chart.group().all());
        removeElements(rows);
        updateElements(rows);
        updateLabels(rows);
        updateTitles(rows);
    }

    function createElements(rows, rowData) {
        var rowEnter = rows.enter()
                           .append("g")
                           .attr("class", function(d, i) {
                                return _rowCssClass + " _" + i;
                           });

        rowEnter.append("rect").attr("width", 0);

        createTitles(rowEnter);

        createLabels(rowEnter);
    }

    function removeElements(rows) {
        rows.exit().remove();
    }

    function updateElements(rows) {
        var n = _chart.group().all().length;

        var height = (_chart.effectiveHeight() - (n + 1) * _gap) / n;

        var rect = rows.attr("transform", function(d, i) { return "translate(0," + ((i + 1) * _gap + i * height) + ")"; })
                       .select("rect")
                           .attr("height", height)
                           .attr("fill", _chart.getColor)
                           .on("click", onClick)
                           .classed("deselected", function (d) { return (_chart.hasFilter()) ? !_chart.isSelectedRow(d) : false; })
                           .classed("selected", function (d) { return (_chart.hasFilter()) ? _chart.isSelectedRow(d) : false; });

        dc.transition(rect, _chart.transitionDuration())
               .attr("width", function(d) {
                    return _xScale(_chart.valueAccessor()(d));
               });
    }

    function createTitles(rowEnter) {
        if (_chart.renderTitle()) {
            rowEnter.append("title").text(function(d) {
                return _chart.title()(d);
            });
        }
    }

    function updateTitles(rows) {
        if (_chart.renderTitle()) {
            rows.select("title").text(function(d) {
                return _chart.title()(d);
            });
        }
    }

    function createLabels(rowEnter) {
        if (_chart.renderLabel()) {
            rowEnter.append("text");
        }
    }

    function updateLabels(rows) {
        if (_chart.renderLabel()) {
            rows.select("text")
                        .attr("x", _labelOffsetX)
                        .attr("y", _labelOffsetY)
                        .attr("class", function (d, i) {
                            return _rowCssClass + " _" + i;
                        })
                        .text(function(d) {
                            return _chart.label()(d);
                        });
        }
    }

    function numberOfRows() {
        return _chart.group().all().length;
    }

    function rowHeight() {
        var n = numberOfRows();
        return (_chart.effectiveHeight() - (n + 1) * _gap) / n;
    }

    function onClick(d) {
        _chart.onClick(d);
    }

    _chart.doRedraw = function() {
        drawChart();
        return _chart;
    };

    _chart.xAxis = function () {
        return _xAxis;
    };

    _chart.gap = function(g) {
        if (!arguments.length) return _gap;
        _gap = g;
        return _chart;
    };

    _chart.labelOffsetX = function (o) {
        if (!arguments.length) return _labelOffsetX;
        _labelOffset = o;
        return _chart;
    };

    _chart.labelOffsetY = function (o) {
        if (!aruguments.length) return _labelOffsetY;
        _labelOffset = o;
        return _chart;
    };

    _chart.isSelectedRow = function (d) {
        return _chart.filter() == _chart.keyAccessor()(d);
    };

    _chart.elasticX = function (_) {
        if (!arguments.length) return _xElasticity;
        _xElasticity = _;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};