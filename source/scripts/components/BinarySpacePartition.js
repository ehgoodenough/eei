var BinarySpacePartition = React.createClass({
   render: function() {
       if(this.props.tree.branch0 !== undefined
       && this.props.tree.branch1 !== undefined) {
           return (
               <div>
                   <BinarySpacePartition tree={this.props.tree.branch0}/>
                   <BinarySpacePartition tree={this.props.tree.branch1}/>
               </div>
           )
       } else {
           return (
               <div style={this.renderStyles()}/>
           )
       }
   },
   renderStyles: function() {
       return {
           position: "absolute",
           top: this.props.tree.y + "em",
           left: this.props.tree.x + "em",
           height: this.props.tree.height + "em",
           width: this.props.tree.width + "em",
           backgroundColor: this.props.tree.color,
           opacity: 0.5
       }
   }
})

module.exports = BinarySpacePartition
