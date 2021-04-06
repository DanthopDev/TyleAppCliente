import React from 'react';
import { Text } from 'react-native';

export class AvenirBlack extends React.Component {
    render() {
        return <Text {...this.props} style={[this.props.style, { fontFamily: 'AvenirLTStd-Black' }]} />;
    }
}
export class AvenirBlackOblique extends React.Component {
    render() {
        return <Text {...this.props} style={[this.props.style, { fontFamily: 'AvenirLTStd-BlackOblique' }]} />;
    }
}
export class AvenirBook extends React.Component {
    render() {
        return <Text {...this.props} style={[this.props.style, { fontFamily: 'AvenirLTStd-Book' }]} />;
    }
}
export class AvenirHeavy extends React.Component {
    render() {
        return <Text {...this.props} style={[this.props.style, { fontFamily: 'AvenirLTStd-Heavy' }]} />;
    }

}
export class AvenirMedium extends React.Component {
    render() {
        return <Text {...this.props} style={[this.props.style, { fontFamily: 'AvenirLTStd-Medium' }]} />;
    }

}