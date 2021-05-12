import React from 'react';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { ExpandMore } from '@material-ui/icons';

const Input = withStyles((theme) => ({
  input: {
    boxSizing: 'border-box',
    borderRadius: 6,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    fontFamily: 'Nunito',
    width: '16rem',
    transition: theme.transitions.create(['box-shadow']),
    '&:focus': {
      borderRadius: 4,
      boxShadow: '0 0 4px 2px #2684ff',
      backgroundColor: '#fff',
    },
    '&:hover': {
      boxShadow: '0 0 12px -1px #2684ff',
    },
  },
}))(InputBase);

const SelectWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  margin-top: 0.5rem;
`;

const CalculationTypeWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  align-items: center;
  text-align: justify;
  padding: 2rem 2rem 0 2rem;
`;

const Header = styled.h2`
  font-weight: normal;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Paragraph = styled.p`
  margin: 0.5rem;
`;

const CalculateHeader = styled.p`
  margin-bottom: 0.5rem;
`;

const CalculationTypes = (props) => {
  const [
    setProbability,
    setProbabilityText,
    setIsCalculatingFinished,
  ] = props.setStates;

  const handleChange = (e) => {
    const selectName = e.target.name;
    const newValue = e.target.value;
    props.inputCallback({ [selectName]: newValue });
    props.callback(setProbability, '');
    props.callback(setProbabilityText, '');
    props.callback(setIsCalculatingFinished, false);
  };

  return (
    <CalculationTypeWrapper>
      <Header>Dice probability calculator</Header>
      <Paragraph>
        With this application you can calculate the probability of getting
        specific sums with different kinds of dice, such as d4, d6, d8, d10 etc.
        Non-standard dice (such as d5 and d7) are also supported.
      </Paragraph>
      <Paragraph>
        You can also calculate probabilites of rolling specific number of dice
        with certain face values, such as the probability of rolling at least
        two 6s when rolling three standard d6 dice.
      </Paragraph>

      <Paragraph>
        To use this application, first select your desired calculation type
        (dice sums or dice face values). Next, add the dice with which you want
        to roll. You can click the dice images below to add the dice to the
        input field, or write them directly to the field.
      </Paragraph>

      <Paragraph>
        After selecting the calculation type and the dice with which you want to
        roll, select the probability type, enter the target value what you want
        to roll and click Calculate!
      </Paragraph>
      <SelectWrapper>
        <CalculateHeader>I want to calculate</CalculateHeader>
        <FormControl>
          <Select
            value={props.value}
            onChange={handleChange}
            input={<Input name="calculationType" />}
            IconComponent={ExpandMore}
          >
            <MenuItem style={{ minWidth: '16rem' }} value={'diceSums'}>
              Dice sums
            </MenuItem>
            <MenuItem style={{ minWidth: '16rem' }} value={'diceFaces'}>
              Dice face values
            </MenuItem>
          </Select>
        </FormControl>
      </SelectWrapper>
    </CalculationTypeWrapper>
  );
};

export default CalculationTypes;
