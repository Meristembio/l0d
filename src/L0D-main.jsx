import React, {Component} from 'react'
import Select from 'react-select'

import L0DPartsStandards from "./components/L0D-parts-standards"
import L0DReceivers from "./components/L0D-receivers"
import L0DEnzymes from "./components/L0D-enzymes"

import {
    clearSequence,
    getReverseComplementSequenceString,
    tmSeq
} from './components/Helpers'
import {
    getDigestFragmentsForRestrictionEnzymes,
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

class DisplayResult extends Component {
    render() {
        let items = []
        let output = []
        if (this.props.data.length) {
            output.push(<h4>Final sequence</h4>)
        } else {
            output.push(<div>No sequence input or no reciver defined</div>)
        }
        this.props.data.map((item) => items.push(
            <span class="display-item">
        <span class="display-item-name">{item.name}</span>
        <span class="display-item-seq" data-bs-toggle="tooltip" data-bs-placement="top"
              title="Tooltip on top">{item.seq}</span>
    </span>
        ))
        output.push(
            <div class="alert alert-light border">{items}</div>
        )
        let primer_design = []
        if (this.props.primer_data.ready) {
            primer_design.push(<h4>Primers ({this.props.method})</h4>)
            this.props.primer_data.primers.forEach((fragment_primers) => {
                let primers = []
                fragment_primers.primers.forEach((primer) => {
                    primers.push(<div>
                        <h5>{">" + primer.name} ({primer.seq.length} nt)</h5>
                        <p>{primer.seq}</p>
                    </div>)
                })
                primer_design.push(
                    <div class="alert alert-light border">
                        <h5>{"Primers fragment #" + fragment_primers.fragment_id}</h5>
                        {primers}
                    </div>
                )
            })
        }
        return (
            <div id="result">
                {output}
                {primer_design}
            </div>
        )
    }
}

class L0D extends Component {
    constructor(props) {
        super(props)
        const defaultStandard = 'loop'
        this.state = {
            sequence: "agagactctcgcagagggctccctatagccgaGCTCTTCtagggcttgtgacacacagctcggatacggctatgggctagagac",
            output: [],
            standard: defaultStandard,
            oh5: L0DPartsStandards[defaultStandard].default[5],
            oh3: L0DPartsStandards[defaultStandard].default[3],
            custom_oh5: '',
            custom_oh3: '',
            receiver: L0DReceivers['pl0r'],
            method: 'pcr',
            tm: 60,
            name: '',
            enzymes: ['sapi', 'bsai', 'aari'],
            primer_data: {
                ready: false
            }
        }
    }

    componentDidMount() {
        this.doDesign()
    }

    doDesign = () => {
        const receiver = this.state.receiver
        const sequenceInput = this.state.sequence

        if (!sequenceInput || !receiver) {
            this.setState({
                output: [],
            })
            return
        }
        let RES = []
        this.state.enzymes.forEach((enzyme_name) => {
            RES.push(aliasedEnzymesByName[enzyme_name])
        })
        const digestFragments = getDigestFragmentsForRestrictionEnzymes(sequenceInput, false, RES)
        let fragments = []

        digestFragments.forEach((digestFragment) => {
            fragments.push(sequenceInput.substring(digestFragment.start, digestFragment.end))
        })

        const receiverEnzymeSiteWithExtraNucl = receiver.enzyme.prevNucl + receiver.enzyme.site + receiver.enzyme.postNucl
        const receiverEnzymeSiteWithExtraNuclRevComp = getReverseComplementSequenceString(receiverEnzymeSiteWithExtraNucl)

        let oh5 = {
            'name': 'custom',
            'oh': this.state.custom_oh5
        }
        if (this.state.oh5 !== "custom") {
            oh5 = L0DPartsStandards[this.state.standard].ohs[this.state.oh5]
        }

        let oh3 = {
            'name': 'custom',
            'oh': this.state.custom_oh3
        }
        if (this.state.oh3 !== "custom") {
            oh3 = L0DPartsStandards[this.state.standard].ohs[this.state.oh3]
        }

        const tc = oh3.tc ? "tc" : ""

        let output = []

        output.push({
            name: receiver.enzyme.name,
            seq: receiverEnzymeSiteWithExtraNucl,
            type: 're'
        })
        output.push({
            name: "d-OH",
            seq: receiver.oh5,
            type: 'oh'
        })
        let oh_name = "custom-OH"
        if (oh5.oh.length) {
            oh_name = oh5.name + "-OH"
        }
        output.push({
            name: oh_name,
            seq: oh5.oh,
            type: 'oh'
        })
        output.push({
            name: "Sequence",
            seq: sequenceInput,
            type: 'seq'
        })
        if (tc.length) {
            output.push({
                name: "tc",
                seq: tc,
                type: 'tc'
            })
        }
        oh_name = "custom-OH"
        if (oh3.oh.length) {
            oh_name = oh3.name + "-OH"
        }
        output.push({
            name: oh_name,
            seq: oh3.oh,
            type: 'oh'
        })
        output.push({
            name: "d-OH",
            seq: receiver.oh3,
            type: 'oh'
        })
        output.push({
            name: receiver.enzyme.name,
            seq: receiverEnzymeSiteWithExtraNuclRevComp,
            type: 're'
        })

        let finalSeq = ""
        output.forEach((item) => {
            finalSeq += item.seq
        })

        let primer_data = {
            ready: true,
            primers: []
        }
        let fragment_id = 1
        fragments.forEach((fragment) => {
            let fragment_primers = {
                fragment_id: fragment_id,
                primers: []
            }
            fragment_id += 1
            if (this.state.method === "oann") {
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_id + "-F",
                    seq: finalSeq
                })
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_id + "-R",
                    seq: getReverseComplementSequenceString(finalSeq)
                })
            } else if (this.state.method === "pcr") {
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_id + "-F",
                    seq: receiverEnzymeSiteWithExtraNucl + receiver.oh5 + oh5.oh + tmSeq(fragment, this.state.tm)
                })
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_id + "-R",
                    seq: receiverEnzymeSiteWithExtraNucl + getReverseComplementSequenceString(receiver.oh3) + getReverseComplementSequenceString(oh3.oh) + getReverseComplementSequenceString(tc) + tmSeq(getReverseComplementSequenceString(fragment), this.state.tm)
                })
            }
            primer_data.primers.push(fragment_primers)
        })

        this.setState({
            output: output,
            primer_data: primer_data
        })
    }

    domEnzymesInputChangeHandle = (event) => {
        let newEnzymes = []
        event.forEach((enzyme) => {
            newEnzymes.push(enzyme.value)
        })
        this.setState({
            enzymes: newEnzymes,
        }, () => {
            this.doDesign()
        })
    }

    tmInputChangeHandle = (event) => {
        this.setState({
            tm: event.target.value,
        }, () => {
            this.doDesign()
        })
    }

    nameInputChangeHandle = (event) => {
        this.setState({
            name: event.target.value,
        }, () => {
            this.doDesign()
        })
    }

    sequenceInputChangeHandle = (event) => {
        const clearedSequence = clearSequence(event.target.value)
        this.setState({
            sequence: clearedSequence,
        }, () => {
            this.doDesign()
        })
    }

    partStandardChangeHandle = (event) => {
        this.setState({
            standard: event.target.value,
            oh5: L0DPartsStandards[event.target.value].default[5],
            oh3: L0DPartsStandards[event.target.value].default[3],
        }, () => {
            this.doDesign()
        })
    }

    receiverInputChangeHandle = (event) => {
        this.setState({receiver: L0DReceivers[event.target.value]}, () => {
            this.doDesign()
        })
    }

    OH5InputChangeHandle = (event) => {
        this.setState({oh5: event.target.value}, () => {
            this.doDesign()
        })
    }

    OH3InputChangeHandle = (event) => {
        this.setState({oh3: event.target.value}, () => {
            this.doDesign()
        })
    }

    customOh5InputHandle = (event) => {
        this.setState({custom_oh5: event.target.value}, () => {
            this.doDesign()
        })
    }

    customOh3InputHandle = (event) => {
        this.setState({custom_oh3: event.target.value}, () => {
            this.doDesign()
        })
    }

    pcr_oannInputChangeHandle = (event) => {
        this.setState({method: event.target.value}, () => {
            this.doDesign()
        })
    }

    partStandardInputItems = Object.keys(L0DPartsStandards).map(function (key) {
        return <option key={key} value={key}>{L0DPartsStandards[key].name}</option>
    })

    receiverInputItems = Object.keys(L0DReceivers).map(function (key) {
        return <option key={key} value={key}>{L0DReceivers[key].name}</option>
    })

    getEnzymesSelect = (enzymes) => {
        let domesticationEnzymesOutput = []
        enzymes.forEach((enzyme) => {
            domesticationEnzymesOutput.push({value: enzyme, label: L0DEnzymes[enzyme].name})
        })
        return domesticationEnzymesOutput
    }

    render() {

        const domesticationEnzymesOptions = []
        Object.keys(L0DEnzymes).forEach(function (key) {
            domesticationEnzymesOptions.push({value: key, label: L0DEnzymes[key].name})
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

        return (
            <Container>
                <Row>
                    <Col>
                        <h1>L0 Designer</h1>
                        <div class="alert alert-warning">
                            Domestication not working yet.
                        </div>
                    </Col>
                </Row>
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
                        <h3>Method</h3>
                        <div>
                            <Form.Check type="radio" label="PCR" name="pcr_oann" value="pcr"
                                        onChange={this.pcr_oannInputChangeHandle} defaultChecked={true}/>
                            <FloatingLabel controlId="tmInput" label="Tm primers °C">
                                <FormControl onChange={this.tmInputChangeHandle}
                                             value={this.state.tm} aria-label="Tn oruners"/>
                            </FloatingLabel>
                            <Form.Check type="radio" label="Oligo Annealing" name="pcr_oann" value="oann"
                                        onChange={this.pcr_oannInputChangeHandle}/>
                        </div>
                        <h3>Position</h3>
                        <FloatingLabel controlId="partStandardInput" label="Part Standard">
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
                        <h3>Receiver</h3>
                        <FloatingLabel controlId="receiverInput" label="Receiver">
                            <Form.Select onChange={this.receiverInputChangeHandle} aria-label="Receiver Input">
                                {this.receiverInputItems}
                            </Form.Select>
                        </FloatingLabel>
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
                        <DisplayResult data={this.state.output} method={this.state.method}
                                       primer_data={this.state.primer_data}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default L0D
