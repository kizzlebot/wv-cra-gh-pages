import React from 'react'
import * as R from '@enotarylog/ramda';
import _ from 'lodash';
import { 
  Modal, Button, Form
} from 'react-bootstrap';
import { withFormik, useField } from 'formik';
import * as Yup from 'yup';
import useAppState from 'lib/hooks/AppState';

const schema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
});



const ErrorFeedback = (props) => {
  const [, meta] = useField(props);
  return (meta.touched && meta.error) ? (
    <Form.Control.Feedback type='invalid'>{meta.error}</Form.Control.Feedback>
  ) : <></>
}

const TextInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  
  return (
    <>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="text"
        {...field}
        {...props}
        isInvalid={meta.touched && meta.error}
      />
      <ErrorFeedback name={props.name} />
    </>
  );
};



const ConsumerAuthenticate = ({ handleSubmit, dirty, isValid, show, ...props }) => {
  const appState = useAppState();

  return (
    <Modal 
      show={show} 
      animation={false}
      size='xl'
      onHide={_.noop}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header>Sign in - {appState.status}</Modal.Header>
        <Modal.Body>
          <div>
            <ul>
              {
                _.map(appState.signers, (val) => (
                  <li key={val.id}>{val.firstName} {val.lastName} (machine Id: {val.runId}) - {val.status}</li>
                ))
              }
            </ul>
          </div>
          <Form.Group controlId="firstName">
            <TextInput 
              label='First Name' 
              name='firstName'
            />
          </Form.Group>
          <Form.Group controlId="lastName">
            <TextInput 
              label='Last Name' 
              name='lastName'
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            type='submit'
            disabled={!dirty || !isValid}
          >
            Submit
          </Button>
          
          <Button 
            type='button'
            disabled={_.isEmpty(appState.signers)}
            onClick={props.markReady}
          >
            Finish 
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}


const composeComponent = R.compose(
  withFormik({
    mapPropsToValues: () => ({
      firstName: '',
      lastName: '',
    }),
    validationSchema: schema,
    handleSubmit: async (values, formikBag) => {
      await formikBag.props.addUser(values);
      return formikBag.resetForm();
    }
  })
);


export default composeComponent(ConsumerAuthenticate);