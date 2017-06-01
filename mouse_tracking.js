var points = [];
var initial = true;

$(document).ready(function(){
    $(document).on('mousemove', function(e){
        $('#floating-window').css({
            left:  e.pageX + 10,
            top:   e.pageY + 10,
            display: 'block'
        }).empty().html(e.pageX+', '+e.pageY);
    });
    $(document).mouseleave(function(){
        $("#floating-window").css({display: 'none'});
        // alert('dejo');
    });
});

$('#wrapper').click(function(e){
    if (initial) {
        points = [];
        initial = false;
        $('#response').val(null);
        $('.point').remove();
        $('.point-coords').remove();
        $('#response').css({display: 'block'});
        if($('#remote_response').length){
            $('#remote_response').remove();
        }
    }
    points.push({x: e.pageX, y: e.pageY});
    drawPoint(e);
    drawPointCoords(e);
});

$('#wrapper').contextmenu(function(e){
    points.push({x: e.pageX, y: e.pageY});
    drawPoint(e);
    drawPointCoords(e);
});

$('#check-button').click(function(e){
    getFigureData();
});

function updateFloatingWindow(e) {
    $('#floating-window').css({
        left:  e.x + 10,
        top:   e.y + 10,
        display: 'block'
    }).empty().html(e.pageX+', '+e.pageY);
}

function drawPoint(e){
    $('#wrapper').append('<div class="point" style="position:fixed;background-color:cyan;'+
                        'width:5px;height:5px;display:block;left:'+e.pageX+';'+
                        ' top:'+e.pageY+';"></div>');
}

function drawPointCoords(e){
    $('#wrapper').append('<div class="point-coords" style="position:fixed;background-color:#F5ECCE;'+
                        'display:block;left:'+(e.pageX+5)+';top:'+(e.pageY+5)+
                        ';font-size:10px">'+e.pageX+','+e.pageY+'</div>');
}

function getFigureData(){
    var elements_number = points.length;

    switch (elements_number) {
        case 3:
            triangle();
            break;
        case 4:
            square();
            break;
    
        default:
            $('#response').val(getTraveledDistance());
            break;
    }
    initial = true;
}

function triangle(){
    
    if (!isTriangle()) {
        $('#response').val(getTraveledDistance());
        return;
    }

    var index, vector, vectors = [], magnitudes = [], coords_string = '[';
    var coords_string_64, string_params, type;

    for (index = 0; index < points.length; index++) {
        if((index+1) === points.length){
            vector = {
                x: points[0].x-points[index].x,
                y: points[0].y-points[index].y
            };
        }else{
            vector = {
                x: points[index+1].x-points[index].x,
                y: points[index+1].y-points[index].y
            };
        }
        coords_string += '('+points[index].x+','+points[index].y+'),';
        vectors.push(vector);
        magnitudes.push(getMagnitude(vector));
    }
    coords_string = coords_string.substr(0, (coords_string.length-1))+']';
    coords_string_64 = window.btoa(coords_string);
    type = isIsosceles(magnitudes) ? 'isosceles' : 'other';
    string_params = '?area=' + getTriangleArea(magnitudes).toString() + '&type=' + type + '&points=' + coords_string_64;
    console.log(getURLString('triangle', string_params));
    $('#response').css({display: 'none'});
    $('#wrapper-response').append('<object id="remote_response" type="text/html" data='+getURLString('triangle', string_params)+'></object>');
}

function square(){
    var data_square = isSquare(), string_params;
    if(!data_square){
        $('#response').val(getTraveledDistance());
        return;
    }
    string_params = '?area=' + getSquareArea(data_square.magnitude) + '&points=' + data_square.string_64;
    
    $('#response').css({display: 'none'});
    $('#wrapper-response').append('<object id="remote_response" type="text/html" data='+getURLString('square', string_params)+'></object>');
}

function getMagnitude(vector){
    return Math.sqrt(Math.pow(vector.x, 2)+Math.pow(vector.y, 2));
}

function isSquare(){
    var index, magnitude_initial, vector, vectors = [], coords_string = '[';
    var coords_string_64;

    for (index = 0; index < points.length; index++) {
        if((index+1) === points.length){
            vector = {
                x: points[0].x-points[index].x,
                y: points[0].y-points[index].y
            };
        }else{
            vector = {
                x: points[index+1].x-points[index].x,
                y: points[index+1].y-points[index].y
            };
        }
        if(index === 0){
            magnitude_initial = getMagnitude(vector);
        }else{
            if(getMagnitude(vector) !== magnitude_initial)
                return false;
        }
        coords_string += '('+points[index].x+','+points[index].y+'),';
        vectors.push(vector);
    }

    for (index = 0; index < (vectors.length - 1); index++) {
        if(!isVectorsOrthogonals(vectors[index], vectors[index+1])){
            return false;
        }
    }

    coords_string = coords_string.substr(0, (coords_string.length-1))+']';
    coords_string_64 = window.btoa(coords_string);

    return {magnitude: magnitude_initial, string_64: coords_string_64};
}

function isVectorsOrthogonals(vec1, vec2){
    var product_scalar = (vec1.x*vec2.x) + (vec1.y*vec2.y);

    if(product_scalar === 0)
        return true;

    return false;
}

function getSquareArea(magnitude){
    return Math.pow(magnitude, 2);
}

function isTriangle(){
    var index, slopes=[];

    for (index = 0; index < (points.length-1); index++) {
        slopes.push((points[index+1].y-points[index].y)/(points[index+1].x-points[index].x));
    }

    if (slopes[0] === slopes[1]) {
        return false;
    }

    return true;
}

function isIsosceles(magnitudes){
    var index, cont = 0;

    for (index = 0; index < magnitudes.length; index++) {
        if (index+1 === magnitudes.length) {
            if(magnitudes[index] === magnitudes[0])
                cont++; 
        }else{
            if(magnitudes[index] === magnitudes[index+1])
                cont++;
        }
    }

    if (cont === 1)
        return true;

    return false;
}

function getTriangleArea(magnitudes){
    var s = 0, index, area;

    for (index = 0; index < magnitudes.length; index++) {
        s += magnitudes[index];
    }

    s = s/2;

    area = Math.sqrt(s*(s-magnitudes[0])*(s-magnitudes[1])*(s-magnitudes[2]));

    return area;
}

function getTraveledDistance(){
    var index, vector, distance = 0;

    for (index = 0; index < (points.length - 1); index++) {
        vector = {
            x: points[index+1].x-points[index].x,
            y: points[index+1].y-points[index].y
        };
        distance += getMagnitude(vector);
    }
    return distance;
}

function getURLString(figure_type, params){
    var url_string = 'https://warm-thicket-98293.herokuapp.com/';
    url_string += (figure_type + params);

    return url_string;
}