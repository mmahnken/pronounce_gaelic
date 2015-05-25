/** @jsx React.DOM */

var AudioVisualization = React.createClass({displayName: 'AudioVisualization',
  getInitialState: function() {
    return({

    });
  },
  create: function(el, props, state) {
    var svg = d3.select(el).append('svg')
        .attr('class', 'd3')
        .attr('width', props.width)
        .attr('height', props.height);

    svg.append('g')
        .attr('class', 'd3-points');

    this.update(el, state);
  },
  update: function(el, state) {
    // Re-compute the scales, and render the data points
    var scales = this._scales(el, this.props.domain);
    if (this.props.data.length > 0 && this.props.domain.x.length > 0) {
        this._drawPoints(el, scales, this.props.data);
    }
  },
  _scales: function(el, domain) {
    if (!domain) {
      return null;
    }

    var width = el.offsetWidth;
    var height = el.offsetHeight;

    var x = d3.scale.linear()
      .range([0, width])
      .domain(domain.x);

    var y = d3.scale.linear()
      .range([height, 0])
      .domain(domain.y);

    var z = d3.scale.linear()
      .range([5, 20])
      .domain([1, 10]);
    return {x: x, y: y, z: z};
  },
  destroy: function(el) {
    // Any clean-up would go here
    // in this example there is nothing to do
  },
  _drawPoints: function(el, scales, data) {
    var g = d3.select(el).selectAll('.d3-points');

    var barWidth = el.offsetWidth / data.length;
    
    var point = g.selectAll('.d3-point')
      .data(data);

    // ENTER
    point.enter().append('circle')
        .attr('class', 'd3-point');

    // ENTER & UPDATE
    point.attr("cy", function(d) { return el.offsetHeight - scales.z(d); })
      .attr("cx", function(d, i) {
        return scales.x(i);
    })
      .attr("r", 1)
      .attr("fill", function(d) {
        if ((el.offsetHeight - scales.z(d)) < (0.3*el.offsetHeight)) {
            return "purple";
        } else if ((el.offsetHeight - scales.z(d)) < (0.6*el.offsetHeight)) {
            return "orange";
        } else {
            return "green";
        }
      })
      // .attr("height", function(d) { return el.offsetHeight - scales.z(d); })
      // .attr("width", barWidth - 1);

    // EXIT
    point.exit()
        .remove();
  },
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object
  },
  componentDidMount: function() {
    var el = this.getDOMNode();
    this.create(el, {
      width: '100%',
      height: '300px'
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    this.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain
    };
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    this.destroy(el);
  },

  render: function() {
    return (
      React.DOM.div( {className:"chart"})
    );
  }
});
