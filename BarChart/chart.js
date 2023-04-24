const fs = require('fs');
const { createCanvas, registerFont} = require('canvas');
const Chart = require('chart.js/auto');
const Canvas = require('canvas');


const width = 350;
const height = 465;
// registerFont('BarChart/ptserif.ttf', { family: 'ptserif' })

const createImage = async (jsonData) => {
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    const chartData = jsonData.sort((a, b) => parseFloat(b.Value) - parseFloat(a.Value));
    const datapoints = chartData.map(item => parseFloat(item.Value));
    const names = chartData.map(item => item.Company);


    const colors = [];
    const images = [];

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    const sum = (Math.round(datapoints.reduce(reducer) * 10) / 10).toFixed(1);

    for (const [index, value] of names.entries()) {
        try {
            const image = await Canvas.loadImage(`BarChart/resources/${value}.png`);
            images.push({
                id: index,
                image: image,
                name: value
            });
        } catch (e) {
            images.push({
                id: index,
                image: null,
                name: value
            });
        }
    }


    datapoints.forEach(value => {
        if (value < 0) {
            colors.push("#bbbaba")
        } else {
            colors.push("#c7dbf1")
        }
    })

    const data = {
        labels: datapoints,
        datasets: [{
            label: 'Companies',
            data: datapoints,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 0
        }]
    };

    // barAvatar plugin block 

    const barAvatar = {
        id: 'barAvatar',
        async beforeDraw(chart, args, options) {
            const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart;
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect(left, top, width, height);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Arial';

            const barHeight = chart.getDatasetMeta(0).data[0].height;
            images.forEach((value, index) => {
                if (value.image) {
                    if(datapoints[index] > 0) {
                        ctx.drawImage(value.image, x.getPixelForValue(0) - 70, y.getPixelForValue(value.id) -15, 60,30);
                    }else {
                        ctx.drawImage(value.image, x.getPixelForValue(0) + 5, y.getPixelForValue(value.id) -15, 60,30);

                    }
                } else {
                    const textWidth = ctx.measureText(value.name).width;
                    console.log(datapoints[index]);
                    if (datapoints[index] > 0) {
                        ctx.fillText(value.name, x.getPixelForValue(0) - textWidth - 5, y.getPixelForValue(value.id) +2.5)
                    }
                    else {
                        ctx.fillText(value.name,x.getPixelForValue(0) + 5, y.getPixelForValue(value.id) + 2.5)
                    }
                }
            })

        }
    }

    const plugin = {
        id: 'custom_canvas_background_color',
        beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        },
        defaults: {
            color: 'white'
        }
    }

    const labelsPlugin = {
        id: 'labelsPlugib',
        async afterDatasetsDraw(chart, args, options) {
            const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Arial';
            datapoints.forEach((value, index) => {
                const textWidth = ctx.measureText(value).width;
                if (value > 0) {
                    ctx.fillText(value, x.getPixelForValue(value) + 5, y.getPixelForValue(index) + 2.5)
                } else {
                    ctx.fillText(`(${Math.abs(value)})`, x.getPixelForValue(value) - textWidth * 1.5, y.getPixelForValue(index) + 2.5)
                }
            })
        }
    }

    const dashedBorders = {
        id: 'dashedBorders',
        beforeDatasetsDraw(chart, args, pluginOptions) {
            const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart;
            ctx.save();
            ctx.beginPath();

            ctx.strokeStyle = '#00355f';
            ctx.lineWidth = 2;
            ctx.setLineDash([2, 3])

            ctx.moveTo(left , top);
            ctx.lineTo(left - right * 0.1, top);
            ctx.moveTo(left- right * 0.1, top);
            ctx.lineTo(left- right * 0.1, bottom * 0.55);
            ctx.moveTo(left- right * 0.1, bottom * 0.60);
            ctx.lineTo(left- right * 0.1, bottom);
            ctx.moveTo(left- right * 0.1, bottom);
            ctx.lineTo(left , bottom);

            // Add the text between the lines
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Arial';
            const text = sum;
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, 5, (bottom * 0.55 + bottom * 0.60) / 2 + 5);



            ctx.closePath();
            ctx.stroke();
        }
    }


    const config = {
        type: 'bar',
        data,
        options: {
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 50,
                    right: 5,
                    top: 10,
                    bottom: 10
                
                }
            },
            plugins: {
                legend: false,
                customCanvasBackgroundColor: {
                    color: 'white', // Set the color to white
                }
            },
            scales: {
                y: {
                    display: false,

                },
                x: {
                    display: false,
                    grid: {
                        color: (context) => {
                            if (context.tick.value === 0) {
                                return '#23476c'
                            }
                        },
                        lineWidth: 2
                    },
                    ticks: {
                        display: false,
                        backdropPadding: {
                            x: 100,
                            y: 100
                        }
                    },
                    suggestedMin: -30
                },
            },
            backgroundColor: 'lightgreen', // Add this line to set background color
        },
        plugins: [plugin, barAvatar, dashedBorders, labelsPlugin]
    };


    new Chart(context, config);
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
};

module.exports = {
    createImage
};
