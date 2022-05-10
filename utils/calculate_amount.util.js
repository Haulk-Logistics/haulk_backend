const calculate_amount = async (input_distance) => {
    const distance = parseInt(input_distance);
    let initial_amount = 1000;
    const required_amount = Math.round(initial_amount * distance);
    initial_amount = required_amount + initial_amount

    return initial_amount;
}

module.exports = {
    calculate_amount
}