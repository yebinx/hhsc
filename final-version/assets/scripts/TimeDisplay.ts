import { _decorator, Component, Node, Label, LabelOutline, Color, Font, LabelShadow, Size, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DynamicTimeDisplay')
export class DynamicTimeDisplay extends Component {

    @property(Font)
    customFont: Font | null = null; // Assign this through the editor

    @property(Color)
    shadowColor: Color = new Color(0x36 / 255, 0x34 / 255, 0x34 / 255); // Default shadow color (363434)

    @property({ type: CCFloat }) // Specify type as CCFloat
    shadowBlur: number = 1; // Default shadow blur radius

    @property(Size)
    shadowOffset: Size = new Size(2, -1); // Default shadow offset

    start() {
        // Create a new Node for the label
        const labelNode = new Node('TimeLabel');
        labelNode.setParent(this.node); // Set this node as parent
    
        // Add and configure Label component
        const label = labelNode.addComponent(Label);
        label.string = '00:00:00'; // Initial time placeholder
        if (this.customFont) {
            label.font = this.customFont;
        }
        label.color = Color.WHITE;
        label.fontSize = 26; // Set the font size to 25
    
        // Add and configure LabelOutline component
        const outline = labelNode.addComponent(LabelOutline);
        outline.color = new Color(0x36 / 255, 0x34 / 255, 0x34 / 255); // Outline color (363434)
        outline.width = 1.3;
    
        // Add and configure LabelShadow component
        const shadow = labelNode.addComponent(LabelShadow);
        shadow.color = this.shadowColor;
        shadow.blur = this.shadowBlur;
        shadow.offset = this.shadowOffset; // Set shadow offset
   
        // Update the label to display the current time
        this.updateTime(label);
        this.schedule(() => this.updateTime(label), 1);
    }
    
    updateTime(label: Label) {
        const now = new Date();
        const hours = ('0' + now.getHours()).slice(-2);
        const minutes = ('0' + now.getMinutes()).slice(-2);
        const seconds = ('0' + now.getSeconds()).slice(-2);
        const timeString = `${hours}:${minutes}:${seconds}`; // Use template literals properly
        label.string = timeString;
    }
}