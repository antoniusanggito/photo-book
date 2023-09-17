import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useAddContactMutation } from '../../generated/graphql';
import Button from '../shared/Button';
import toast from 'react-hot-toast';
import { exclSpChar, phoneNum } from '../../utils/filterKeyInput';

export type FormValues = {
  firstName: string;
  lastName: string;
  phones: {
    number: string;
  }[];
};

const initialFormValues = {
  firstName: '',
  lastName: '',
  phones: [{ number: '' }],
};

const FormWrapper = styled.section`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  /* border: 1px solid #bbb; */
  padding: 0.5rem;

  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }

  input[type='text'],
  input[type='tel'] {
    width: 100%;
    height: 2.5rem;
    padding: 0 10px;
  }
`;

const AddForm: React.FC = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: initialFormValues });

  const { fields, append, remove } = useFieldArray({
    name: 'phones',
    control,
  });

  const [addContact] = useAddContactMutation({
    onCompleted: (data) => {
      reset();
      toast.success(
        `Added contact ${data.insert_contact?.returning[0].first_name} ${data.insert_contact?.returning[0].last_name}`
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    // delete contact cache to re-request updated pagination
    update(cache) {
      cache.evict({ fieldName: 'contact' });
      cache.gc();
    },
    // // not needed to refetch after deleting cache
    // refetchQueries: [
    //   {
    //     query: GET_REG_CONTACTS,
    //     variables: {
    //       offset: pagination.offset,
    //       limit,
    //       favIds: getFavIds(fav),
    //       like: pagination.like,
    //     },
    //   },
    // ],
  });

  const onSubmit = handleSubmit((data) => {
    addContact({
      variables: {
        first_name: data.firstName,
        last_name: data.lastName,
        phones: data.phones,
      },
    });
  });

  return (
    <FormWrapper>
      <h3
        css={css`
          margin-bottom: 0.5rem;
        `}
      >
        Add Contact
      </h3>
      <form onSubmit={onSubmit}>
        <div
          css={css`
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 0.25rem;
          `}
        >
          <input
            type="text"
            id="firstName"
            placeholder="First Name"
            maxLength={20}
            onKeyDown={exclSpChar}
            {...register('firstName', {
              required: '*First Name is required',
            })}
          />
          <input
            type="text"
            id="lastName"
            placeholder="Last Name"
            maxLength={20}
            onKeyDown={exclSpChar}
            {...register('lastName', {
              required: '*Last Name is required',
            })}
          />
        </div>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          `}
        >
          {fields.map((field, index) => (
            <div
              css={css`
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                gap: 0.25rem;
              `}
              key={index}
            >
              {index > 0 && (
                <Button
                  type="button"
                  role="tertiary"
                  onClick={() => remove(index)}
                >
                  -
                </Button>
              )}
              <input
                type="tel"
                id={`phones.${index}`}
                maxLength={20}
                placeholder={
                  index > 0 ? `Phone Number ${index + 1}` : 'Phone Number'
                }
                onKeyDown={phoneNum}
                {...register(`phones.${index}.number` as const, {
                  required: 'Input Phone Number',
                  pattern: {
                    value: /^[0-9\b+\-.]+$/,
                    message: '*Phone number is invalid',
                  },
                  minLength: {
                    value: 3,
                    message: '*Phone number is invalid',
                  },
                })}
              />
              {index == 0 && (
                <Button
                  type="button"
                  role="secondary"
                  onClick={() => append({ number: '' })}
                >
                  +
                </Button>
              )}
            </div>
          ))}
        </div>
        <div
          css={css`
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
          `}
        >
          <div>
            {errors.firstName && <p>{`${errors.firstName.message}`}</p>}
            {errors.lastName && <p>{`${errors.lastName.message}`}</p>}
          </div>
          <Button type="submit" role="secondary" w={80} h={40}>
            Submit
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
};

export default AddForm;
