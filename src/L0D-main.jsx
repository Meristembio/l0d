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
    render() {
        if (this.props.text) {
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
            if (this.props.extra)
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
                    <option key={key}
                            value={key}>{L0DPartsStandards[this.props.standard].ohs[key].name + (L0DPartsStandards[this.props.standard].ohs[key].tc ? ' (+tc)' : '')}</option>
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

class Primer extends Component {
    render() {
        return <div>
            <div>{"> " + this.props.name + "-" + this.props.type}</div>
            <div className="alert alert-warning">{this.props.seq}</div>
        </div>
    }
}

class PrimerDesign extends Component {
    render() {
        const fragment_name = this.props.name + "-F" + (this.props.idx + 1)
        let primers = []
        let method = "pcr"
        if (this.props.template.length <= this.props.pcrMinLength) {
            method = "oann"
        }
        if(method == "oann"){
            const finalSeq = this.props.eswen + this.props.extra5 + this.props.template + this.props.extra3 + getReverseComplementSequenceString(this.props.eswen)
            primers.push(<Primer seq={finalSeq} name={fragment_name} type={"F"}/>)
            primers.push(<Primer seq={getReverseComplementSequenceString(finalSeq)} name={fragment_name} type={"R"}/>)
        } else {
            const finalSeq_fwd = this.props.eswen + this.props.extra5 + tmSeq(this.props.template, this.props.pcrTm)
            primers.push(<Primer seq={finalSeq_fwd} name={fragment_name} type={"F"}/>)
            const finalSeq_rev = getReverseComplementSequenceString(this.props.extra3 + this.props.eswen) + tmSeq(getReverseComplementSequenceString(this.props.template), this.props.pcrTm)
            primers.push(<Primer seq={finalSeq_rev} name={fragment_name} type={"R"}/>)
        }
        return (<div className="alert alert-light border text-break">
            <h5>{fragment_name}</h5>
            <div>Method: {method}</div>
            {primers}
        </div>)
    }
}


class ResEditor extends Component {
    constructor(props) {
        super(props)
        if (props.new_res === undefined)
            this.resInputHandle(this.props.res.idx, this.props.res.seq)
    }

    resInputHandle = (i, v) => {
        this.props.resInputHandle(i, v)
    }

    render() {
        if (this.props.res) {
            let equal_warwing = ""
            let res = this.props.res
            let new_res = this.props.new_res ? this.props.new_res : ""

            if (res.seq.toLowerCase() === new_res.toLowerCase())
                equal_warwing = <div className="alert alert-danger">Restriction site unchanged</div>
            let diferent_length_warwing = ""

            if (res.seq.length !== new_res.length && new_res.length > 0)
                diferent_length_warwing =
                    <div className="alert alert-warning">New restriction site has different length than original</div>

            let frame_string = ""
            if (new_res) {
                let start = new_res.substring(0, res.start % 3) + "-"
                if (start.length === 1)
                    start = ""
                frame_string = " (" + start + new_res.substring(res.start % 3, res.start % 3 + 3) + ")"
            }

            return <div className="alert alert-info border">
                <h5>Restriction site # {res.idx + 1}</h5>
                <div className="row">
                    <div className="col-7">
                        <FloatingLabel controlId={"resInput" + res.idx} label="New restriction enzyme site">
                            <FormControl onChange={(e) => this.resInputHandle(res.idx, e.target.value)}
                                         value={new_res} aria-label="New restriction enzyme site"/>
                        </FloatingLabel>
                        <div className="mb-2">
                            <button type="button" className="btn btn-secondary me-2"
                                    onClick={(e) => this.resInputHandle(res.idx, res.seq)}>Reset
                            </button>
                            <button type="button" className="btn btn-secondary me-2" onClick={(e) => {
                                alert("To be implemented")
                            }}>Recommended
                            </button>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="mb-2 small">
                            <span><strong>Enzyme</strong>: {res.enzyme}</span><br/>
                            <span><strong>Position</strong>: {(res.start + 1) + " to " + (res.end + 1)}</span><br/>
                            <span><strong>Frame position</strong>: {((res.start % 3) + 1) + frame_string}</span><br/>
                        </div>
                    </div>
                </div>
                {equal_warwing}
                {diferent_length_warwing}
            </div>
        } else {
            return <div></div>
        }
    }
}

class Fragments extends Component {
    constructor(props) {
        super(props)
        let new_res = []
        props.res.forEach((re) => {
            new_res.push(re.seq)
        })
        this.state = {
            new_res: new_res
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

    firstCommonIndexAfterDiff(ref, query) {
        let firstIndex = null
        let diffFound = false
        if (ref.length === query.length)
            for (var i = 0; i < query.length; i++) {
                if (ref.charAt(i).toLowerCase() === query.charAt(i).toLowerCase())
                    if (diffFound && ref.substring(i, query.length) === query.substring(i, query.length)) {
                        firstIndex = i
                        break
                    } else
                        diffFound = true
            }
        return firstIndex
    }

    lastCommonIndex(ref, query) {
        let lastIndex = 0
        for (var i = 0; i < Math.min(ref.length, query.length); i++) {
            if (ref.charAt(i).toLowerCase() === query.charAt(i).toLowerCase())
                lastIndex = i
            else
                break
        }
        return lastIndex
    }

    resParts(ref, query) {
        const lastCommonIndex = this.lastCommonIndex(ref, query)
        const firstCommonIndexAfterDiff = this.firstCommonIndexAfterDiff(ref, query)

        let start = ref.substring(0, lastCommonIndex + 1)
        let diff = ""
        let end = ""
        if (firstCommonIndexAfterDiff && firstCommonIndexAfterDiff > lastCommonIndex) {
            diff = ref.substring(lastCommonIndex + 1, firstCommonIndexAfterDiff)
            end = ref.substring(firstCommonIndexAfterDiff, query.length)
        }

        return {
            'start': start,
            'diff': diff,
            'end': end,
        }
    }

    resInputHandle = (i, v) => {
        let new_res = this.state.new_res
        new_res[i] = clearSequence(v)
        this.setState({
            new_res: new_res
        })
    }

    formatOH(seq, oh_length){
        return seq.substring(0, oh_length).toUpperCase() + seq.substring(oh_length, seq.length).toLowerCase()
    }

    render() {
        let output = []
        let final_sequence = []
        let domestication_output = []
        let fragments = []
        const tc_bases = 'tc'
        let extra5 = ""
        let extra3 = ""
        let minOhLengthAlert = ""
        const oh_length = Math.abs(this.props.the_re.topSnipOffset - this.props.the_re.bottomSnipOffset)

        final_sequence.push(<Highlight text={this.props.eswen} type="eswen" key="1"
                                       extra={" (" + this.props.the_re.name + ")"}/>)
        final_sequence.push(<Highlight text={this.props.doh5} type="doh" key="2"/>)
        extra5 += this.props.doh5
        final_sequence.push(<Highlight text={this.props.oh5.oh} type="oh" key="3"/>)
        extra5 += this.props.oh5.oh

        if (this.props.res.length) {
            domestication_output.push(<h4>Domestication</h4>)
            let from = 0
            this.props.res.forEach((re, idx) => {
                final_sequence.push(<Highlight text={this.props.seq.substring(from, re.start)} type="seq"
                                               extra={" fragment " + (idx + 1)} key={"s-" + idx}/>)
                let template = this.props.seq.substring(from, re.start)

                let type = "res"
                let seq = re.seq
                if (this.state.new_res[idx] && this.state.new_res[idx] !== re.seq) {
                    type = "res_dom"
                    seq = this.state.new_res[idx]
                }
                final_sequence.push(<Highlight text={seq} type={type} extra={" # " + (idx + 1)} key={"r-" + idx}/>)
                template += this.commonStart(this.state.new_res[idx], re.seq)

                if (idx) {
                    const resParts = this.resParts(this.state.new_res[idx - 1], this.props.res[idx - 1].seq)
                    extra5 = resParts.diff
                    template = resParts.end + template
                }

                if(idx === this.props.res.length - 1){
                    const resParts = this.resParts(this.state.new_res[idx], re.seq)
                    extra3 = (resParts.diff + resParts.end + this.props.seq.substring(re.end + 1, this.props.seq.length)).substring(0, oh_length)
                    if(extra3.length < oh_length)
                        minOhLengthAlert = <div className="alert alert-danger">OH length under optimal length</div>
                }

                fragments.push({
                    idx: idx,
                    extra5: this.formatOH(extra5, oh_length),
                    template: template.toLowerCase(),
                    extra3: this.formatOH(extra3, oh_length),
                })
                domestication_output.push(<ResEditor resInputHandle={this.resInputHandle}
                                                     new_res={this.state.new_res[idx]} res={re}/>)
                domestication_output.push(minOhLengthAlert)
                from = re.end + 1

                if(idx === this.props.res.length - 1){
                    const resParts = this.resParts(this.state.new_res[idx], re.seq)
                    extra5 = resParts.diff
                    template = resParts.end + this.props.seq.substring(from, this.props.seq.length)
                    fragments.push({
                        idx: idx + 1,
                        extra5: this.formatOH(extra5, oh_length),
                        template: template.toLowerCase(),
                        extra3: "",
                    })
                }
            })
        } else {
            final_sequence.push(<Highlight text={this.props.seq} type="seq" key="s-1"/>)
        }

        final_sequence.push(<Highlight text={this.props.oh3.tc ? tc_bases : ''} type="tc" key="6"/>)
        extra3 = this.props.oh3.tc ? tc_bases : ''
        final_sequence.push(<Highlight text={this.props.oh3.oh} type="oh" key="7"/>)
        extra3 += this.props.oh3.oh
        final_sequence.push(<Highlight text={this.props.doh3} type="doh" key="8"/>)
        extra3 += this.props.doh3
        final_sequence.push(<Highlight text={getReverseComplementSequenceString(this.props.eswen)} type="eswen"
                                       key="9" extra={" (RevComp) (" + this.props.the_re.name + ")"}/>)
        fragments[fragments.length - 1].extra3 = this.formatOH(extra3, oh_length)

        let fragments_output = []
        fragments.forEach((fragment) => {
            fragments_output.push(<PrimerDesign name={this.props.name} pcrMinLength={this.props.pcrMinLength}
                                                pcrTm={this.props.pcrTm} idx={fragment.idx} extra5={fragment.extra5}
                                                extra3={fragment.extra3} template={fragment.template} eswen={this.props.eswen} />)
        })

        output.push(<h4>Amplicon / Oligo annealing sequence</h4>)
        output.push(<div className="alert alert-light border text-break">{final_sequence}</div>)

        output.push(domestication_output)

        output.push(<h4>Primer design</h4>)
        output.push(fragments_output)
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
            const cutSites = getCutsitesFromSequence(sequenceInput + "aaaaaaaaaaaaa", false, RES)

            let restrictionSites = []

            if (Object.keys(cutSites).length) {
                Object.entries(cutSites).forEach(([key, enzymeCuts]) => {
                    enzymeCuts.forEach((enzymeCut, idx) => {
                        restrictionSites.push({
                            seq: sequenceInput.substring(enzymeCut.recognitionSiteRange['start'], enzymeCut.recognitionSiteRange['end'] + 1),
                            start: enzymeCut.recognitionSiteRange['start'],
                            end: enzymeCut.recognitionSiteRange['end'],
                            enzyme: enzymeCut.name
                        })
                    })
                    restrictionSites.sort(function (a, b) {
                        return a.start - b.start
                    })
                    restrictionSites.forEach((restrictionSite, idx) => {
                        restrictionSite.idx = idx
                    })
                })
            }

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
                                the_re={the_re} res={restrictionSites} oh5={oh5} oh3={oh3}
                                doh5={the_standard.receiver_ohs.oh5} doh3={the_standard.receiver_ohs.oh3}
                                eswen={enzymeSiteWithExtraNucl} seq={sequenceInput}/>
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
