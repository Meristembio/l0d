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
        let output = []
        if (this.props.data.length) {
            output.push(<h4>Final sequence</h4>)
        } else {
            output.push(<div>No sequence input or no reciver defined</div>)
        }
        let seqParts = []
        this.props.data.forEach((item) => {
            seqParts.push(<p>
                <strong>{item.name}</strong> ({item.type}): {item.seq}
            </p>)
        })

        output.push(
            <div class="alert alert-light border">{seqParts}</div>
        )
        let primer_design = []
        if (this.props.primer_data.ready) {
            primer_design.push(<h4>Primers</h4>)
            const fragments_len = this.props.primer_data.primers.length
            const fragments_output = fragments_len - 1 + " restriction site(s) found. Part will be created from " + fragments_len + " fragment(s)."
            primer_design.push(<div className="alert alert-info">{fragments_output}</div>)

            this.props.primer_data.primers.forEach((fragment_primers) => {
                let primers = []
                fragment_primers.primers.forEach((primer) => {
                    primers.push(<div>
                        <h5>{">" + primer.name} ({primer.seq.length} nt)</h5>
                        <p>{primer.seq}</p>
                    </div>)
                })
                let amplicon_size = ""
                if(fragment_primers.amplicon_size)
                    amplicon_size = "Amplicon: " + fragment_primers.amplicon_size + " bp"
                primer_design.push(
                    <div class="alert alert-light border">
                        <h5>{"Primers fragment #" + fragment_primers.fragment_id + " (" + fragment_primers.method + ")"}</h5>
                        {amplicon_size}
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
            pcrTm: 60,
            pcrMinLength: 90,
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
        if(digestFragments.length)
            digestFragments.forEach((digestFragment) => {
                fragments.push({
                    seq: sequenceInput.substring(digestFragment.start, digestFragment.end)
                })
            })
        else
            fragments.push({
                seq: sequenceInput.substring(0, sequenceInput.length)
            })

        const receiverEnzymeSiteWithExtraNucl = receiver.enzyme.prevNucl + receiver.enzyme.site + receiver.enzyme.postNucl
        const receiverEnzymeSiteWithExtraNuclRevComp = getReverseComplementSequenceString(receiverEnzymeSiteWithExtraNucl)

        let output = []
        let primer_data = {
            ready: true,
            primers: []
        }

        for (const [fragment_index, fragment] of fragments.entries()) {
            let oh5 = {
                'name': 'Custom',
                'oh': this.state.custom_oh5
            }
            if (this.state.oh5 !== "custom") {
                oh5 = L0DPartsStandards[this.state.standard].ohs[this.state.oh5]
            }
            if(fragment_index){
                // not the first element
                oh5 = {
                    'name': 'Internal',
                    'oh': ''
                }
            }
            let oh3 = {
                'name': 'Custom',
                'oh': this.state.custom_oh3
            }
            if (this.state.oh3 !== "custom") {
                oh3 = L0DPartsStandards[this.state.standard].ohs[this.state.oh3]
            }
            if(fragment_index !== fragments.length-1){
                // not the last element
                oh3 = {
                    'name': 'Internal',
                    'oh': '',
                    'tc': null
                }
            }

            const tc = oh3.tc ? "tc" : ""

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
                seq: fragment.seq,
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

            let fragment_primers = {
                fragment_id: fragment_index,
                method: '',
                amplicon_size: 0,
                primers: []
            }

            if (fragment.seq.length <= this.state.pcrMinLength) {
                fragment_primers.method = "Oligo Annealing"
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_index + "-F",
                    seq: finalSeq
                })
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_index + "-R",
                    seq: getReverseComplementSequenceString(finalSeq)
                })
            } else {
                fragment_primers.method = "PCR"
                fragment_primers.amplicon_size = finalSeq.length
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_index + "-F",
                    seq: receiverEnzymeSiteWithExtraNucl + receiver.oh5 + oh5.oh + tmSeq(fragment.seq, this.state.pcrTm)
                })
                fragment_primers.primers.push({
                    name: this.state.name + '-F' + fragment_index + "-R",
                    seq: receiverEnzymeSiteWithExtraNucl + getReverseComplementSequenceString(receiver.oh3) + getReverseComplementSequenceString(oh3.oh) + getReverseComplementSequenceString(tc) + tmSeq(getReverseComplementSequenceString(fragment.seq), this.state.pcrTm)
                })
            }
            primer_data.primers.push(fragment_primers)
        }

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

    pcrMinLengthInputChangeHandle = (event) => {
        this.setState({
            pcrMinLength: event.target.value,
        }, () => {
            this.doDesign()
        })
    }

    pcrTmInputChangeHandle = (event) => {
        this.setState({
            pcrTm: event.target.value,
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
                        <DisplayResult data={this.state.output} name={this.state.name} method={this.state.method}
                                       primer_data={this.state.primer_data}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default L0D
