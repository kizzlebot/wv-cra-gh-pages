import React from 'react'
import { Modal, Button } from 'react-bootstrap';





const ConfirmationModal = (props) => {
  return (
    <Modal
      show={props.show}
      animation={false}
      size='sm'
    >

      <Modal.Header>Confirm</Modal.Header>
      <Modal.Body>
        {props.message}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={props.onSubmit}>Confirm</Button>
        <Button onClick={props.onHide}>Cancel</Button>
      </Modal.Footer>

    </Modal>
  )
}
export default ConfirmationModal;