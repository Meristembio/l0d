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
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


class Highlight extends Component {
    render(){
        if(this.props.text) {
            let overlay_text = ""
            switch (this.props.type) {
                case 'eswen':
                    overlay_text = "Restriction site"
                    break
                case 'doh':
                    overlay_text = "Domestication overhang"
                    break
                case 'oh':
                    overlay_text = "Overhang"
                    break
                case 'seq':
                    overlay_text = "Sequence"
                    break
                case 'res':
                    overlay_text = "Internal restriction site"
                    break
                case 'res_dom':
                    overlay_text = "Internal restriction site (domesticated)"
                    break
                case 'tc':
                    overlay_text = "Overhang complement bases for frame conservation"
                    break
                default:
                    break
            }
            if(this.props.extra)
                overlay_text += " " + this.props.extra
            return <OverlayTrigger key={"ot" + this.props.key} placement="top" overlay={
                <Tooltip id={"id" + this.props.key}>{overlay_text}</Tooltip>
            }>
                <span className={"hl hl-" + this.props.type}>{this.props.text}</span>
            </OverlayTrigger>
        }
        return <i></i>
    }
}


class InputOHS extends Component {
    render() {
        return <Form.Select
            onChange={this.props.handler}
            value={this.props.cv}
            aria-label={L0DPartsStandards[this.props.standard].name + " OHs / " + this.props.oh + "'"}
            className="oh-select" ref={"ref" + this.props.oh}>
            {Object.keys(L0DPartsStandards[this.props.standard].ohs).map((key) => {
                return (
                    <option key={key} value={key}>{L0DPartsStandards[this.props.standard].ohs[key].name + (L0DPartsStandards[this.props.standard].ohs[key].tc?' (+tc)':'')}</option>
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


class ResEditor extends Component {
    resInputHandle = (i, v) => {
        this.props.resInputHandle(i, v)
    }

    render() {
        if (this.props.res) {
            let equal_warwing = ""
            if (this.props.res.toLowerCase() === this.props.new_res.toLowerCase())
                equal_warwing = <div className="alert alert-danger">Restriction site unchanged</div>
            let diferent_length_warwing = ""
            if (this.props.res.length !== this.props.new_res.length)
                diferent_length_warwing =
                    <div className="alert alert-danger">New restriction site has different length than original: frame
                        shift if part is a CDS</div>
            return <div className="alert alert-info border">
                <h5>Restriction site domestication</h5>
                <FloatingLabel controlId={"resInput" + this.props.idx} label="New restriction enzyme site">
                    <FormControl onChange={(e) => this.resInputHandle(this.props.idx, e.target.value)}
                                 value={this.props.new_res} aria-label="New restriction enzyme site"/>
                </FloatingLabel>
                <div className="mb-2">
                    <span>Frame position: {this.props.frame_pos}</span>
                </div>
                <div className="mb-2">
                    <button type="button" className="btn btn-secondary me-2"
                            onClick={(e) => this.resInputHandle(this.props.idx, this.props.res)}>Reset to original
                    </button>
                    <button type="button" className="btn btn-secondary me-2" onClick={(e) => {
                        alert("Not implemented")
                    }}>Show recommendation
                    </button>
                </div>
                {equal_warwing}
                {diferent_length_warwing}
            </div>
        } else {
            return <div></div>
        }
    }
}


class Primer extends Component {
    render() {
        return <div>
            <div>{"> " + this.props.name + "-" + this.props.type}</div>
            <div className="alert alert-warning">{this.props.seq}</div>
        </div>
    }
}


class PrimerDesign extends Component {
    resInputHandle = (i, v) => {
        this.props.resInputHandle(i, v)
    }

    seqOverflow(ref, query){
        let finalSeq = ""
        let lastIndex = 0
        for (var i = 0; i < Math.min(ref.length, query.length); i++) {
            if (ref.charAt(i).toLowerCase() === query.charAt(i).toLowerCase())
                lastIndex = i
            else
                break
        }
        finalSeq += query.substring(lastIndex + 1, query.length)
        return finalSeq
    }

    render() {
        const fragment_name = this.props.name + "-F" + (this.props.idx + 1)
        let primers = []
        if (this.props.method === 'oann') {
            const finalSeq = this.props.eswen + this.props.doh5 + this.props.oh5 + this.props.seq + this.props.tc + this.props.oh3 + this.props.doh3 + getReverseComplementSequenceString(this.props.eswen).toLowerCase()
            primers.push(<Primer seq={finalSeq} name={fragment_name} type={"F"}/>)
            primers.push(<Primer seq={getReverseComplementSequenceString(finalSeq)} name={fragment_name} type={"R"}/>)
        } else {
            // pcr
            const finalSeq_fwd = this.props.eswen + this.props.doh5 + this.props.oh5 + tmSeq(this.props.template, this.props.pcrTm)
            primers.push(<Primer seq={finalSeq_fwd} name={fragment_name} type={"F"}/>)
            const finalSeq_rev = this.props.eswen + getReverseComplementSequenceString(this.props.oh3 + this.props.doh3).toUpperCase() + getReverseComplementSequenceString(this.props.tc) + tmSeq(getReverseComplementSequenceString(this.props.template + this.seqOverflow(this.props.res, this.props.new_res)), this.props.pcrTm).toLowerCase()
            primers.push(<Primer seq={finalSeq_rev} name={fragment_name} type={"R"}/>)
        }
        return (<div className="alert alert-light border text-break">
            <h5>{fragment_name}</h5>
            <div>Method: {this.props.method}</div>
            <ResEditor resInputHandle={this.resInputHandle} frame_pos={this.props.seq_no_res.length % 3}
                       new_res={this.props.new_res} res={this.props.res} idx={this.props.idx}/>
            {primers}
            <div className="alert alert-info small collapse">
                <p><strong>Idx</strong>: {this.props.idx}</p>
                <p><strong>Method</strong>: {this.props.method}</p>
                <p><strong>doh5</strong>: {this.props.doh5}</p>
                <p><strong>oh5</strong>: {this.props.oh5}</p>
                <p><strong>doh3</strong>: {this.props.doh3}</p>
                <p><strong>oh3</strong>: {this.props.oh3}</p>
                <p><strong>Seq</strong>: {this.props.seq}</p>
                <p><strong>Template</strong>: {this.props.template}</p>
                <p><strong>tc</strong>: {this.props.tc}</p>
                <p><strong>new_res</strong>: {this.props.new_res}</p>
                <p><strong>seq_no_res</strong>: {this.props.seq_no_res}</p>
                <p><strong>res</strong>: {this.props.res}</p>
            </div>
        </div>)
    }
}

class Fragments extends Component {
    constructor(props) {
        super(props)
        let fragments = this.props.fragments
        fragments.forEach((fragment) => {
            fragment.new_res = fragment.res
        })
        this.state = {
            fragments: fragments
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.fragments !== this.props.fragments) {
            let fragments = this.props.fragments
            fragments.forEach((fragment) => {
                fragment.new_res = fragment.res
            })
            this.setState({
                fragments: fragments
            })
        }
    }

    commonStart(seq1, seq2) {
        let finalSeq = ""
        for (var i = 0; i < Math.min(seq1.length, seq2.length); i++) {
            if (seq1.charAt(i).toLowerCase() === seq2.charAt(i).toLowerCase()) {
                finalSeq += seq1.charAt(i)
            } else
                break
        }
        return finalSeq
    }

    resInputHandle = (i, v) => {
        let fragments = this.state.fragments
        fragments[i].new_res = v
        this.setState({
            fragments: fragments
        })
    }

    render() {
        let output = []
        let final_sequence = []
        let fragments_output = []
        const tc_bases = 'tc'

        final_sequence.push(<Highlight text={this.props.eswen} type="eswen" key="1" />)
        final_sequence.push(<Highlight text={this.props.doh5} type="doh" key="2" />)
        final_sequence.push(<Highlight text={this.props.oh5.oh} type="oh" key="3" />)

        this.state.fragments.forEach((fragment, fragment_idx, fragments_arr) => {
            final_sequence.push(<Highlight text={fragment.seq} extra={"fragment " + (fragment_idx + 1)} type="seq" key={"4-" + fragment_idx} />)
            let res_type = 'res'
            if(fragment.new_res !== fragment.res)
                res_type = 'res_dom'
            final_sequence.push(<Highlight text={fragment.new_res} type={res_type} key={"5-" + fragment_idx} />)
            let oh5 = ""
            let oh3 = ""
            let doh5 = ""
            let doh3 = ""
            let seq = fragment.seq
            let template = fragment.seq
            let tc = ''
            if (fragment.idx === 0) {
                doh5 = this.props.doh5
                oh5 = this.props.oh5.oh
            } else {
                oh5 = seq.substring(0, this.props.oh_length)
                seq = seq.substring(this.props.oh_length, seq.length)
            }

            if (fragment.idx === this.state.fragments.length - 1) {
                tc = this.props.oh3.tc ? tc_bases : ''
                doh3 = this.props.doh3
                oh3 = this.props.oh3.oh
            } else {
                template = seq + this.commonStart(fragment.res, fragment.new_res)
                seq = seq + fragment.new_res
                oh3 = fragments_arr[fragment_idx + 1].seq.substring(0, this.props.oh_length)
            }
            let method = "pcr"
            if (fragment.seq.length <= this.props.pcrMinLength) {
                method = "oann"
            }
            fragments_output.push(<PrimerDesign resInputHandle={this.resInputHandle} template={template}
                                                name={this.props.name} idx={fragment.idx} pcrTm={this.props.pcrTm}
                                                pcrMinLength={this.props.pcrMinLength} method={method} oh5={oh5}
                                                oh3={oh3} doh5={doh5} doh3={doh3} tc={tc} eswen={this.props.eswen}
                                                seq={seq} res={fragment.res} new_res={fragment.new_res} seq_no_res={fragment.seq}/>)
        })

        final_sequence.push(<Highlight text={this.props.oh3.tc ? tc_bases : ''} type="tc" key="6" />)
        final_sequence.push(<Highlight text={this.props.oh3.oh} type="oh" key="7" />)
        final_sequence.push(<Highlight text={this.props.doh3} type="doh" key="8" />)
        final_sequence.push(<Highlight text={this.props.eswen} type="eswen" key="9" />)

        output.push(<h4>Amplicon / Oligo annealing sequence</h4>)
        output.push(<div className="alert alert-light border text-break">{final_sequence}</div>)
        output.push(<h4>Primer design</h4>)
        output.push(<div>{fragments_output}</div>)
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
            pcrMinLength: 20,
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
        this.setState({
            sequence: clearSequence(event.target.value),
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
        this.setState({custom_oh5: clearSequence(event.target.value)})
    }

    customOh3InputHandle = (event) => {
        this.setState({custom_oh3: clearSequence(event.target.value)})
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
            if (defaultEnzymesByName[k].isType2S)
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
            let idx = 0

            if (Object.keys(cutSites).length) {
                Object.entries(cutSites).forEach(([key, enzymeCuts]) => {
                    enzymeCuts.forEach((enzymeCut) => {
                        recognitionSites.push({
                            start: enzymeCut.recognitionSiteRange['start'],
                            end: enzymeCut.recognitionSiteRange['end'],
                            enzyme: enzymeCut.name
                        })
                    })
                    recognitionSites.sort(function (a, b) {
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
                        idx += 1
                    })
                    fragments.push({
                        idx: idx,
                        seq: sequenceInput.substring(nextStart, sequenceInput.length),
                        res: ""
                    })
                    idx += 1
                })
            } else
                fragments.push({
                    idx: idx,
                    seq: sequenceInput.substring(0, sequenceInput.length),
                    res: ""
                })

            console.log(fragments)

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

            output = <Fragments name={this.state.name} pcrMinLength={this.state.pcrMinLength} pcrTm={this.state.pcrTm}
                                oh_length={Math.abs(the_re.topSnipOffset - the_re.bottomSnipOffset)}
                                fragments={fragments} oh5={oh5} oh3={oh3} doh5={the_standard.receiver_ohs.oh5}
                                doh3={the_standard.receiver_ohs.oh3} eswen={enzymeSiteWithExtraNucl}/>
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
                        <h3>Method parameters</h3>
                        <div>
                            <FloatingLabel controlId="pcrMinLengthInput"
                                           label="Length under which part is prepared by oligo annealing instead of PCR">
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
