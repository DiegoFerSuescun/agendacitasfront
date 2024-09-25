import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from 'dayjs';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton  } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App(){

  const localizer = dayjsLocalizer(dayjs);
  const [ newEvent, setNewEvent ] = useState({
    title:"",
    start: "",
    end: "",
    name: "",
    phone: "",
    service: "",
    date: "",
    notes: "",
    id: null
  });
  const [ modalOpen, setModalOpen] = useState(false);
  const [ slot, setSlot ] = useState(null);
  const [ startEvent, setStartEvent ] = useState('');
  const [ endtEvent, setEndEvent ] = useState('');
  const [postTimeslots, setPostTimeslots] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [ edit, setEdit ] = useState(false);
  const [ eventsback, setEventsBack ] = useState([])
  const [events, setEvents] = useState([
    {
      start: dayjs('2024-09-24T14:00:00').toDate(),
      end: dayjs('2024-09-24T16:00:00').toDate(),
      title: "evento 1"
    },
    {
      start: dayjs('2024-09-24T15:00:00').toDate(),
      end: dayjs('2024-09-24T17:30:00').toDate(),
      title: "evento 2"
    },
  ]);
 

  useEffect(() => {
    const fetchEvents = async () => {

      try {
        const response = await axios('http://localhost:3005/api/events');
        // console.log("ESTE ES MI RESPONSE ", response);
        const formattedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
      }));
        setEventsBack(response.data);
        setEvents(formattedEvents)
      } catch (error) {
        console.log("OCURRIO UN ERROR EN EL FETCH DEL BACK ", error);
        
      } 
    };

    fetchEvents();
  },[]);

  useEffect(() => {
  
  if (startEvent) {
    const today = dayjs().startOf('day');
    const filteredTimeslots = timeSlots.filter(time => {
      const timeSlot = today.hour(parseInt(time.split(':')[0])).minute(parseInt(time.split(':')[1]));
      return timeSlot.isAfter(dayjs(today).hour(parseInt(startEvent.split(':')[0])).minute(parseInt(startEvent.split(':')[1])));
    });

    // console.log(filteredTimeslots);
    
    setPostTimeslots(filteredTimeslots);
  } else {
    setPostTimeslots([]);
  }
  },[startEvent])

  const timeSlots = Array.from({length:21}, (_,i) => 
  dayjs().startOf('day').add(8, 'hour').add(i * 30, 'minute').format('HH:mm'));
  
  const services = ['Servicio 1', 'Servicio 2', 'Servicio 3'];
  //MANEJADOR PARA LA SELECCION DE UN SLOT

  const handleSlot = (slotInfo) => {   
    setSlot(slotInfo);
    const selected = slotInfo.start? dayjs(slotInfo.start).format('YYYY-MM-DD'): null;    
    const nextdays = Array.from({length: 7}, (_, i) => 
      dayjs(selected).add(i, 'day').format('YYYY-MM-DD')
    );
    setDateOptions(nextdays)
    setNewEvent({
      ...newEvent,
      start: slotInfo?.start,
      end: slotInfo?.end,
      date: selected
    })
    setModalOpen(true);
  };
  
  //MANEJADOR DE EL ENVIO DE EVENTO
  
  const handlesendEvent = async () => {
    if (!newEvent.title || !startEvent || !endtEvent || !newEvent.name || !newEvent.phone || !newEvent.service || !newEvent.date || !newEvent.notes) {
      alert("Please fill out all fields");
    }
    const eventDate = dayjs(newEvent.date).startOf('day');

    const updatedEventID = {
      title: newEvent.title,
      start: eventDate
      .set('hour', startEvent.split(':')[0])
      .set('minute', startEvent.split(':')[1])
      .toDate(),
      end: eventDate
      .set('hour', endtEvent.split(':')[0])
      .set('minute', endtEvent.split(':')[1])
      .toDate(),
      name: newEvent.name,
      phone: newEvent.phone,
      service: newEvent.service,
      date: newEvent.date,
      notes: newEvent.notes,
      id: newEvent.id
    };
    
    try {
      if (edit) {
        const datatosend = {
          title: newEvent.title,
        start: dayjs(newEvent.date)
            .set('hour', startEvent.split(':')[0])
            .set('minute', startEvent.split(':')[1])
            .toISOString(),
        end: dayjs(newEvent.date)
            .set('hour', endtEvent.split(':')[0])
            .set('minute', endtEvent.split(':')[1])
            .toISOString(), 
        name: newEvent.name,
        phone: newEvent.phone,
        service: newEvent.service,
        date: newEvent.date,
        notes: newEvent.notes
        }
        await axios.put(`http://localhost:3005/api/events/${newEvent.id}`, datatosend);
        setEvents(events.map(event => event.id === newEvent.id ? updatedEventID : event));
      } else {
        const datatosend = {
          title: newEvent.title,
        start: dayjs(newEvent.date)
            .set('hour', startEvent.split(':')[0])
            .set('minute', startEvent.split(':')[1])
            .toISOString(),
        end: dayjs(newEvent.date)
            .set('hour', endtEvent.split(':')[0])
            .set('minute', endtEvent.split(':')[1])
            .toISOString(), 
        name: newEvent.name,
        phone: newEvent.phone,
        service: newEvent.service,
        date: newEvent.date,
        notes: newEvent.notes
        }
        const response = await axios.post(`http://localhost:3005/api/events`, datatosend);
        const dataResponse = response.data;
        
        const formattedEvent = {
          ...dataResponse,
          start: new Date(dataResponse.start),
          end: new Date(dataResponse.end),
      };
        
        setEvents([...events, formattedEvent]);        
      }
  
      setModalOpen(false);
      resetForm(); 
    } catch (error) {
      console.log("Ocurrio un error en el try catch de posteo o update ", error);
      alert('Oppss, please try again!')
      return;  
    };
  };

  //MANEJADOR PARA ACTUALIZAR UN EVENTO

  const handleEventClick = (event) => {
    // console.log("EVENTTTTTTTTTTTTTTTTTTTTTTTT ", event); 
    setNewEvent({...event, date: dayjs(event.date).format('YYYY-MM-DD')}); // 
    setStartEvent(dayjs(event.start).format('HH:mm'));
    setEndEvent(dayjs(event.end).format('HH:mm'));
    setEdit(true);
    setModalOpen(true); 
  };

  //PARA CERRAR O CANCELAR EL MODAL
  const handleOnCancel = () => {
    setModalOpen(false);
    setNewEvent({ title: "", start: "", end: "", date: "", name:"", phone: "", service: "", notes: "" });
    setStartEvent('');
    setEndEvent('');
    setEdit(false)
  }

  //PARA ELMINIAR UN EVENTO OJO NO ES BORRADO LOGICO
  const handleDeleteEvent = async (eventInfo) => {
    const idevent = newEvent?.id;
    try {
      await axios.delete(`http://localhost:3005/api/events/${idevent}`);
      setEvents(events.filter(event => event.id !== newEvent.id))
      handleOnCancel();
    } catch (error) {
      console.log("UPPPS AH ocurrido un problema al eliminar el vento");
      alert('Oopss try again!')
    } 
  };

  //RESETEAR EL FORMULARIO

  const resetForm = () => {
    setNewEvent({ title: "", start: "", end: "", date: "", name:"", phone: "", service: "", notes: "" , id: null });
    setStartEvent('');
    setEndEvent('');
    setEdit(false);
  };

  //CUstomToolbar
  const CustomToolbar = ({ label, onNavigate, view, onView }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <IconButton onClick={() => onNavigate('PREV')}>
            <ArrowBack />
          </IconButton>
          <IconButton onClick={() => onNavigate('NEXT')}>
            <ArrowForward />
          </IconButton>
          <Button onClick={() => onNavigate('TODAY')} variant="contained" size="small">
            Today!
          </Button>
        </div>
        <h4>{label}</h4>
        <div style={{ display: "flex", gap: "3%"}}>
          <Button onClick={() => onView('month')} variant={view === 'month' ? 'contained' : 'outlined'} size="small">
            Month
          </Button>
          <Button onClick={() => onView('week')} variant={view === 'week' ? 'contained' : 'outlined'} size="small">
            Week
          </Button>
          <Button onClick={() => onView('day')} variant={view === 'day' ? 'contained' : 'outlined'} size="small">
            Day
          </Button>
        </div>
      </div>
    );
  };

  const components = {
    event: props => {
      return <div
      style={{
        display: "flex",
        flexDirection: "row",
        textAlign: "end",
        gap: "3px",
        marginTop: "2px",
        fontSize: "15px"
      }}>
        <CalendarMonthIcon fontSize='small'/>
        {props.event.title}
      </div>
    },
    toolbar: CustomToolbar
  };

  const dayPropGetter = (date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return {
        style: {
          backgroundColor: 'rgb(196, 202, 205)',
          color: '#00796b', 
        }
      };
    }
    return {}; 
  };

  const PresentationCard = () => {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        width: '100%',
        backgroundColor: '#f5f5f5',
      }}>
        <h2>¡Welcome to our Calendar!</h2>
        <p>
          Here you can manage your events, reservations and appointments quickly and easily. 
          Select a date, add details and organize your agenda like never before.
        </p>
        <h4>Do you need help??</h4>
        <p>
          Contact us if you have any questions or problems. We are here to assist you.
        </p>
        <p>
          Developer: Diego Suescun.
        </p>
      </div>
    );
  };

  return(
    <div style={{ display: 'flex', height: "95vh", width: "90vw", padding: '20px' }}>
      <div style={{height: "95vh", width: "70vw"}}>
        <Calendar 
          localizer={localizer}
          events={events}
          views={["month", "week", "day"]}
          defaultView='month'
          selectable={true}
          formats={{
            dayHeaderFormat: date => {
              return dayjs(date).format('dddd-DD/MM')
            }
          }}
          components={components}
          onSelectSlot={handleSlot} 
          onSelectEvent={handleEventClick}
          dayPropGetter={dayPropGetter}
        />
      </div>
      
      <div style={{ width: "15%", marginLeft: "4%", marginTop: "5%" }}>
        <PresentationCard />
      </div>
      
      {/* Modal para agregar */}

      <Dialog className='modalMui' open={modalOpen} onClose={() => handleOnCancel()} sx={{ "& .MuiDialog-paper": { width: '40vh', maxWidth: '400px', height: '70vh', minHeight: "70vh" } }}>
        <DialogTitle sx={{ 
            textAlign: 'center',  
            fontWeight: 'bold',   
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {edit ? 'Edit reservations' : 'Add to reservations'}
          </DialogTitle>
          <DialogContent>
          <hr style={{ border: '1px solid #ccc' }} />
            <TextField
              autoFocus
              margin='dense'
              label='Title'
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              required
            />
            <TextField
              autoFocus
              margin='dense'
              label='Name'
              value={newEvent.name}
              onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
              required
            />
            <TextField
              autoFocus
              margin='dense'
              label='Phone'
              value={newEvent.phone}
              onChange={(e) => setNewEvent({...newEvent, phone: e.target.value})}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="service-label">Service *</InputLabel>
                <Select 
                  labelId="service-label" // Asigna labelId
                  value={newEvent.service} 
                  onChange={(e) => setNewEvent({ ...newEvent, service: e.target.value})}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Service *" 
                >
                  {services.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="service-label">Date *</InputLabel>
                <Select 
                  labelId="service-label" // Asigna labelId
                  value={newEvent.date} 
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value})}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Date *" 
                >
                  {dateOptions.map((date) => (
                    <MenuItem key={date} value={date}>
                      {dayjs(date).format('dddd, D [de] MMMM [de] YYYY')}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="start-time-label">Start Time *</InputLabel>
                <Select 
                  labelId="start-time-label" // Asigna labelId
                  value={startEvent} 
                  onChange={(e) => setStartEvent(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Start Time *"
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={!startEvent}>
              <InputLabel id="end-time-label">End Time *</InputLabel>
                <Select 
                  labelId="end-time-label" // Asigna labelId
                  value={endtEvent}
                  onChange={(e) => setEndEvent(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="End Time *" // Esto es para el label flotante
                >
                  {postTimeslots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <TextField
              autoFocus
              margin='dense'
              label='Notes'
              value={newEvent.notes}
              onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
              required
            />
            {
              edit ? (
                <Button sx={{marginTop: "10%"}} startIcon={<DeleteIcon />} variant="outlined"  size="small" color="error"  onClick={(e) => handleDeleteEvent(e)}>Deseo cancelar este evento</Button>
              ):
              null
            }
            

          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', marginLeft: "2%" }}>
            <Button variant="outlined"  size="small" color="error" onClick={() => handleOnCancel()}>Salir</Button>
            <Button variant="contained" size="small"  onClick={handlesendEvent} endIcon={<SendIcon />}>agregar</Button>
          </DialogActions>
      </Dialog>

    </div>
  )
}

export default App
