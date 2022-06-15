import React, {Component} from 'react'
import Select from 'react-select'

import L0DPartsStandards from "./components/L0D-parts-standards"

import {
    clearSequence,
    getReverseComplementSequenceString,
    tmSeq
} from './components/Helpers'
import {
    defaultEnzymesByName,
    getCutsitesFromSequence,
    aliasedEnzymesByName
} from 've-sequence-utils'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FloatingLabel from 'react-bootstrap/FloatingLabel'


class InputOHS extends Component {
    render() {
        return <Form.Select
            onChange={this.props.handler}
            value={this.props.cv}
            aria-label={L0DPartsStandards[this.props.standard].name + " OHs / " + this.props.oh + "'"}
            className="oh-select" ref={"ref" + this.props.oh}>
            {Object.keys(L0DPartsStandards[this.props.standard].ohs).map((key) => {
                return (
                    <option key={key} value={key}>{L0DPartsStandards[this.props.standard].ohs[key].name}</option>
                )
            })}
            <option key="custom" value="custom">Custom</option>
        </Form.Select>
    }
}

class OHInput extends Component {
    render() {
        return <FloatingLabel controlId={"ohs" + this.props.oh}
                              label={this.props.standard + " OHs / " + this.props.oh + "'"}>
            <InputOHS
                standard={this.props.standard}
                oh={this.props.oh}
                handler={this.props.handler}
                cv={this.props.cv}
            />
        </FloatingLabel>
    }
}


class Fragment extends Component {
    render(){
        return(<div>{this.props.seq}</div>)
    }
}

class Fragments extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fragments: this.props.fragments
        }
    }
    render() {
        let output = []
        let final_sequence = ""
        let fragments_output = []

        final_sequence += this.props.eswen + this.props.doh5 + this.props.oh5.oh

        this.state.fragments.forEach((fragment) => {
            final_sequence += fragment.seq.toLowerCase() + fragment.res.toLowerCase()
            let oh5 = ""
            let oh3 = ""
            let doh5 = ""
            let doh3 = ""
            let tc = ""
            let seq = fragment.seq
            if(fragment.idx === 0){
                doh5 = this.props.doh5
                oh5 = this.props.oh5.oh
            }
            else{
                oh5 = seq.substring(0, this.props.oh_length + 1)
                seq = seq.substring(this.props.oh_length, seq.length)
            }

            if(fragment.idx === this.state.fragments.length - 1){
                doh3 = this.props.doh3
                oh3 = this.props.oh3.oh
            } else{
                oh5 = seq.substring(seq.length - this.props.oh_length, seq.length)
                seq = seq.substring(0, seq.length - this.props.oh_length + 1)
            }
            fragments_output.push(<Fragment oh5={oh5} oh3={oh3} doh5={doh5} doh3={doh3} tc={tc} eswen={this.props.eswen} seq={seq} res={fragment.res} />)
        })

        final_sequence += (this.props.oh3.tc?'tc':'') + this.props.oh3.oh + this.props.doh3 + getReverseComplementSequenceString(this.props.eswen)

        output.push(<h4>Amplicon sequence</h4>)
        output.push(<div className="alert alert-light border text-break">{final_sequence}</div>)
        output.push(<h4>Primer design</h4>)
        output.push(<div className="alert alert-light border">{fragments_output}</div>)
        return <div>{output}</div>
    }
}

class L0D extends Component {
    constructor(props) {
        super(props)
        const default_standard = 'loop'
        this.state = {
            sequence: "agagactctcgcagagggctccctatagccgaGCTCTTCtagggcttgtgacacacagctcggatacggctatgggctagagac",
            standard: default_standard,
            custom_oh5: '',
            custom_oh3: '',
            oh5: L0DPartsStandards[default_standard].default[5],
            oh3: L0DPartsStandards[default_standard].default[3],
            pcrTm: 60,
            pcrMinLength: 90,
            name: 'Part',
            base_pairs_from_end: 'aa',
            enzymes: L0DPartsStandards[default_standard].domestication_enzymes,
        }
    }

    basePairsFromEndInputChangeHandle = (event) => {
        this.setState({
            base_pairs_from_end: event.target.value,
        })
    }


    domEnzymesInputChangeHandle = (event) => {
        let newEnzymes = []
        event.forEach((enzyme) => {
            newEnzymes.push(enzyme.value)
        })
        this.setState({
            enzymes: newEnzymes,
        })
    }

    pcrMinLengthInputChangeHandle = (event) => {
        this.setState({
            pcrMinLength: event.target.value,
        })
    }

    pcrTmInputChangeHandle = (event) => {
        this.setState({
            pcrTm: event.target.value,
        })
    }

    nameInputChangeHandle = (event) => {
        this.setState({
            name: event.target.value,
        })
    }

    sequenceInputChangeHandle = (event) => {
        const clearedSequence = clearSequence(event.target.value)
        this.setState({
            sequence: clearedSequence,
        })
    }

    partStandardChangeHandle = (event) => {
        this.setState({
            standard: event.target.value,
            oh5: L0DPartsStandards[event.target.value].default[5],
            oh3: L0DPartsStandards[event.target.value].default[3],
        })
    }

    OH5InputChangeHandle = (event) => {
        this.setState({oh5: event.target.value})
    }

    OH3InputChangeHandle = (event) => {
        this.setState({oh3: event.target.value})
    }

    customOh5InputHandle = (event) => {
        this.setState({custom_oh5: event.target.value})
    }

    customOh3InputHandle = (event) => {
        this.setState({custom_oh3: event.target.value})
    }

    partStandardInputItems = Object.keys(L0DPartsStandards).map(function (key) {
        return <option key={key} value={key}>{L0DPartsStandards[key].name}</option>
    })

    getEnzymesSelect = (enzymes) => {
        let domesticationEnzymesOutput = []
        enzymes.forEach((enzyme) => {
            domesticationEnzymesOutput.push({value: enzyme, label: defaultEnzymesByName[enzyme].name})
        })
        return domesticationEnzymesOutput
    }

    render() {
        const the_standard = L0DPartsStandards[this.state.standard]
        const domesticationEnzymesOptions = []
        Object.keys(defaultEnzymesByName).forEach(function (k, v) {
            if(defaultEnzymesByName[k].isType2S)
                domesticationEnzymesOptions.push({value: k, label: defaultEnzymesByName[k].name})
        })

        let custom_oh5_input
        if (this.state.oh5 === "custom") {
            custom_oh5_input = <FloatingLabel controlId="customOh5Input" label="Custom OH 5'">
                <FormControl onChange={this.customOh5InputHandle} value={this.state.custom_oh5}
                             aria-label="Custom OH 5"/>
            </FloatingLabel>
        }

        let custom_oh3_input
        if (this.state.oh3 === "custom") {
            custom_oh3_input = <FloatingLabel controlId="customOh3Input" label="Custom OH 3'">
                <FormControl onChange={this.customOh3InputHandle} value={this.state.custom_oh3}
                             aria-label="Custom OH 3"/>
            </FloatingLabel>
        }

        const sequenceInput = this.state.sequence
        let output = ""

        if (!sequenceInput) {
            output = <div className="alert alert-info">Set a sequence to continue</div>
        } else {
            let RES = []
            this.state.enzymes.forEach((enzyme_name) => {
                RES.push(aliasedEnzymesByName[enzyme_name])
            })
            const cutSites = getCutsitesFromSequence(sequenceInput, false, RES)

            let fragments = []
            let recognitionSites = []

            if(Object.keys(cutSites).length) {
                let idx = 1
                Object.entries(cutSites).forEach(([key, enzymeCuts]) => {
                    enzymeCuts.forEach((enzymeCut) => {
                        recognitionSites.push({
                            start: enzymeCut.recognitionSiteRange['start'],
                            end: enzymeCut.recognitionSiteRange['end'],
                            enzyme: enzymeCut.name
                        })
                    })
                    recognitionSites.sort(function(a,b) {
                        return b.start - a.start
                    })
                    let nextStart = 0
                    recognitionSites.forEach((recognitionSite) => {
                        fragments.push({
                            idx: idx,
                            seq: sequenceInput.substring(nextStart, recognitionSite.start),
                            res: sequenceInput.substring(recognitionSite.start, recognitionSite.end + 1)
                        })
                        nextStart = recognitionSite.end + 1
                    })
                    fragments.push({
                        idx: idx,
                        seq: sequenceInput.substring(nextStart, sequenceInput.length),
                        res: ""
                    })
                    idx +=1
                })
            }
            else
                fragments.push({
                    idx: 1,
                    seq: sequenceInput.substring(0, sequenceInput.length),
                    res: ""
                })

            const the_re = defaultEnzymesByName[the_standard.enzyme]
            const enzymeSiteWithExtraNucl = this.state.base_pairs_from_end + the_re.site.toUpperCase() + the_standard.bases_upto_snip

            let oh5 = {
                name: 'Custom',
                oh: this.state.custom_oh5
            }
            if (this.state.oh5 !== "custom") {
                oh5 = the_standard.ohs[this.state.oh5]
            }
            let oh3 = {
                name: 'Custom',
                oh: this.state.custom_oh3
            }
            if (this.state.oh3 !== "custom") {
                oh3 = the_standard.ohs[this.state.oh3]
            }

            output = <Fragments oh_length={Math.abs(the_re.topSnipOffset - the_re.bottomSnipOffset)} fragments={fragments} oh5={oh5} oh3={oh3} doh5={the_standard.receiver_ohs.oh5} doh3={the_standard.receiver_ohs.oh3} eswen={enzymeSiteWithExtraNucl} />
        }

        return (
            <Container>
                <Row>
                    <Col lg={6}>
                        <h2>Inputs</h2>
                        <h3>Part name</h3>
                        <FloatingLabel controlId="nameInput" label="Name Input">
                            <FormControl onChange={this.nameInputChangeHandle}
                                         value={this.state.name} aria-label="Name Input"/>
                        </FloatingLabel>
                        <h3>Sequence ({this.state.sequence.length} bp)</h3>
                        <FloatingLabel controlId="sequenceInput" label="Sequence Input">
                            <FormControl onChange={this.sequenceInputChangeHandle} as="textarea"
                                         value={this.state.sequence} aria-label="Sequence Input"/>
                            <Form.Text className="text-muted">
                                Non ATGC characters are automaticlly removed.
                            </Form.Text>
                        </FloatingLabel>
                        <h3>Method parameters</h3>
                        <div>
                            <FloatingLabel controlId="pcrMinLengthInput" label="Length under which part is prepared by oligo annealing instead of PCR">
                                <FormControl onChange={this.pcrMinLengthInputChangeHandle}
                                             value={this.state.pcrMinLength} aria-label="pcr/oann min length"/>
                            </FloatingLabel>
                            <FloatingLabel controlId="pcrTmInput" label="Tm PCR primers °C">
                                <FormControl onChange={this.pcrTmInputChangeHandle}
                                             value={this.state.pcrTm} aria-label="PCR Tm primers"/>
                            </FloatingLabel>
                            <FloatingLabel controlId="basePairsFromEnd" label="Base pairs from end">
                                <FormControl onChange={this.basePairsFromEndInputChangeHandle}
                                             value={this.state.base_pairs_from_end} aria-label="Base pairs from end"/>
                            </FloatingLabel>
                        </div>
                        <h3>Position</h3>
                        <FloatingLabel controlId="partStandardInput" label="Assembly Standard">
                            <Form.Select onChange={this.partStandardChangeHandle} aria-label="Part standard input">
                                {this.partStandardInputItems}
                            </Form.Select>
                        </FloatingLabel>
                        <OHInput standard={this.state.standard} oh="5" cv={this.state.oh5}
                                 handler={this.OH5InputChangeHandle}/>
                        {custom_oh5_input}
                        <OHInput standard={this.state.standard} oh="3" cv={this.state.oh3}
                                 handler={this.OH3InputChangeHandle}/>
                        {custom_oh3_input}
                        <h3>Domestication</h3>
                        <Form.Text className="text-muted">
                            Domestication enzymes
                        </Form.Text>
                        <Select options={domesticationEnzymesOptions} value={this.getEnzymesSelect(this.state.enzymes)}
                                isMulti className="basic-multi-select" classNamePrefix="select"
                                onChange={this.domEnzymesInputChangeHandle}/>
                    </Col>
                    <Col lg={6}>
                        <h2>Outputs</h2>
                        <div id="result">
                            {output}
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default L0D
