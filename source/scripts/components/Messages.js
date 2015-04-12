var Messages = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.renderMessages()}
            </div>
        )
    },
    renderStyles: function() {
        return {
            left: "0.25em",
            right: "0.25em",
            bottom: "0.25em",
            position: "absolute",
            transitionDuration: "0.25s"
        }
    },
    renderMessages: function() {
        var renderings = []
        for(var index in this.props.data) {
            if(index > 4) {
                break
            }
            var message = this.props.data[index]
            renderings.unshift(
                <Message data={message}
                    key={message.key}
                    index={index}/>
            )
        }
        return renderings
    }
})

var Message = React.createClass({
    render: function() {
        return (
            <div className="message"
                style={this.renderStyles()}>
                {this.props.data.text}
            </div>
        )
    },
    renderStyles: function() {
        return {
            fontSize: "0.75em",
            position: "absolute",
            opacity: (3 - this.props.index) / 3,
            bottom: this.props.index * 1.25 + "em",
            transitionDuration: "0.25s",
            transitionProperty: "top opacity",
            transitionTimingFunction: "ease-out",
			color: this.props.data.color
        }
    }
})

module.exports = Messages
